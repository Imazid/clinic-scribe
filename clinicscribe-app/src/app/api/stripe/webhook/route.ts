import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { logError } from '@/lib/apiSecurity';

/**
 * Service-role client for the webhook. There is no user session — Stripe
 * authenticates via signature verification — and we read/write across all
 * clinics. Use the canonical service-role pattern (`@supabase/supabase-js`)
 * rather than the SSR cookie shim so it's obvious to readers that this
 * code runs OUTSIDE RLS.
 */
function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function serverError(scope: string, err: unknown) {
  logError(scope, err);
  return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logError('stripe-webhook-signature', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ─── Idempotency state machine ────────────────────────────────────────
  //   1. Claim the event by inserting a row with `processed_at = NULL`.
  //      A unique-violation means we (or another worker) already claimed
  //      it — short-circuit with a 200 so Stripe stops retrying.
  //   2. Run side effects.
  //   3. Mark `processed_at = now()` on success.
  //   4. On error: persist `last_error`, leave `processed_at` NULL, return
  //      500 so Stripe retries. The retry will see the duplicate-claim
  //      short-circuit, which is what we want — operator must inspect the
  //      stuck row, fix the underlying problem, then delete the marker
  //      to let Stripe's next retry through.
  //
  //   We deliberately do NOT delete the marker on error: every handler in
  //   this file is an idempotent UPDATE on a clinics row, but we cannot
  //   guarantee that property holds for future handlers. Deleting the
  //   marker would risk double-applying additive side effects on retry.
  // ──────────────────────────────────────────────────────────────────────

  const { error: claimError } = await supabase
    .from('stripe_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: null,
    });

  if (claimError) {
    if ((claimError as { code?: string }).code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return serverError('stripe-webhook-claim', claimError);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clinicId = session.metadata?.clinic_id;
        const plan = session.metadata?.plan;

        if (clinicId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const item = subscription.items.data[0];
          const { error } = await supabase
            .from('clinics')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_subscription_status: subscription.status,
              subscription_tier: plan || 'solo',
              subscription_seats: item?.quantity ?? 1,
              subscription_period_end: item?.current_period_end
                ? new Date(item.current_period_end * 1000).toISOString()
                : null,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            })
            .eq('id', clinicId);

          if (error) throw error;
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const clinicId = subscription.metadata?.clinic_id;

        if (clinicId) {
          const item = subscription.items.data[0];
          const { error } = await supabase
            .from('clinics')
            .update({
              stripe_subscription_status: subscription.status,
              subscription_seats: item?.quantity ?? 1,
              subscription_period_end: item?.current_period_end
                ? new Date(item.current_period_end * 1000).toISOString()
                : null,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            })
            .eq('id', clinicId);

          if (error) throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const clinicId = subscription.metadata?.clinic_id;

        if (clinicId) {
          const { error } = await supabase
            .from('clinics')
            .update({
              stripe_subscription_status: 'canceled',
              subscription_tier: 'solo',
              subscription_seats: 1,
              stripe_subscription_id: null,
              subscription_period_end: null,
              trial_ends_at: null,
            })
            .eq('id', clinicId);

          if (error) throw error;
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          invoice.parent?.subscription_details?.subscription as string | null;

        if (subscriptionId) {
          const { error } = await supabase
            .from('clinics')
            .update({ stripe_subscription_status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) throw error;
        }
        break;
      }
    }

    // Side effects committed — flip the marker to processed.
    await supabase
      .from('stripe_events')
      .update({ processed_at: new Date().toISOString(), last_error: null })
      .eq('event_id', event.id);

    return NextResponse.json({ received: true });
  } catch (err) {
    // Persist the failure for operator triage. We do NOT delete the marker:
    // see the contract comment above.
    const errorText = err instanceof Error ? err.message.slice(0, 500) : String(err).slice(0, 500);
    await supabase
      .from('stripe_events')
      .update({ last_error: errorText })
      .eq('event_id', event.id);
    return serverError('stripe-webhook-dispatch', err);
  }
}
