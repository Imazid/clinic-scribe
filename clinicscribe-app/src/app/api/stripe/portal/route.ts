import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { APP_URL, checkOrigin, forbidden, logError } from '@/lib/apiSecurity';

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      .select('stripe_customer_id')
      .eq('id', profile.clinic_id)
      .single();

    if (!clinic?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: clinic.stripe_customer_id,
      return_url: `${APP_URL}/settings/billing`,
    });

    return NextResponse.json({ portalUrl: portalSession.url });
  } catch (error) {
    logError('stripe-portal', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
