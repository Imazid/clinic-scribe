import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe, PRICE_IDS, SEAT_RANGES } from '@/lib/stripe';
import { APP_URL, checkOrigin, forbidden, logError } from '@/lib/apiSecurity';

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, seats } = body as { plan?: string; seats?: number };

    if (!plan || !['solo', 'clinic', 'group'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be solo, clinic, or group.' },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe Price ID not configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    const seatRange = SEAT_RANGES[plan];
    const quantity = plan === 'solo' ? 1 : (seats ?? seatRange.min);

    if (quantity < seatRange.min || quantity > seatRange.max) {
      return NextResponse.json(
        { error: `Seats must be between ${seatRange.min} and ${seatRange.max} for ${plan} plan` },
        { status: 400 }
      );
    }

    // Get the user's clinic
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: clinic } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', profile.clinic_id)
      .single();

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const stripe = getStripe();

    // Create or retrieve Stripe Customer
    let customerId = clinic.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clinic.email || user.email || '',
        name: clinic.name,
        metadata: {
          clinic_id: clinic.id,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('clinics')
        .update({ stripe_customer_id: customerId })
        .eq('id', clinic.id);
    }

    // Create Checkout Session — redirect URLs must be server-controlled to
    // prevent open-redirect via forged Origin header.
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          clinic_id: clinic.id,
          plan,
        },
      },
      metadata: {
        clinic_id: clinic.id,
        user_id: user.id,
        plan,
      },
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout?plan=${plan}&canceled=true`,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    logError('stripe-checkout', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
