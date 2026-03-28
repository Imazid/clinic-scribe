import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import type Stripe from 'stripe';

// Use service role key for webhook — no user session available
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
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
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

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
        await supabase
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
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const clinicId = subscription.metadata?.clinic_id;

      if (clinicId) {
        const item = subscription.items.data[0];
        await supabase
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
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const clinicId = subscription.metadata?.clinic_id;

      if (clinicId) {
        await supabase
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
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        invoice.parent?.subscription_details?.subscription as string | null;

      if (subscriptionId) {
        await supabase
          .from('clinics')
          .update({ stripe_subscription_status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
