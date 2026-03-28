import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  _stripe = new Stripe(secretKey, {
    typescript: true,
  });

  return _stripe;
}

export const PRICE_IDS: Record<string, string | undefined> = {
  solo: process.env.STRIPE_PRICE_SOLO_MONTHLY,
  clinic: process.env.STRIPE_PRICE_CLINIC_MONTHLY,
  group: process.env.STRIPE_PRICE_GROUP_MONTHLY,
};

export const SEAT_RANGES: Record<string, { min: number; max: number }> = {
  solo: { min: 1, max: 1 },
  clinic: { min: 3, max: 10 },
  group: { min: 11, max: 50 },
};
