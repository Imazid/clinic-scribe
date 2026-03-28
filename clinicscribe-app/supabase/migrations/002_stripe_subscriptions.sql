-- Add Stripe subscription fields to clinics table
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_seats integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Index for quick lookup by Stripe customer
CREATE INDEX IF NOT EXISTS idx_clinics_stripe_customer_id ON clinics (stripe_customer_id);
