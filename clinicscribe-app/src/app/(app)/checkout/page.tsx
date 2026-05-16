'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, AlertCircle } from 'lucide-react';

const PLANS = {
  solo: {
    name: 'Solo',
    price: '$149',
    period: '/month',
    description: 'For individual clinicians',
    seatRange: { min: 1, max: 1 },
    features: [
      '1 clinician seat',
      'Ambient transcription',
      'Structured SOAP notes',
      'Referral draft generation',
      'Up to 80 consultations/month',
      'Email support',
    ],
  },
  clinic: {
    name: 'Clinic',
    price: '$119',
    period: '/seat/month',
    description: 'For small to mid-size practices',
    seatRange: { min: 3, max: 10 },
    features: [
      '3–10 clinician seats',
      'Everything in Solo',
      'Billing & coding support',
      'Follow-up task capture',
      'Prescription drafting assist',
      'Priority support',
      'Admin dashboard',
    ],
  },
  group: {
    name: 'Group Practice',
    price: '$99',
    period: '/seat/month',
    description: 'For multi-practitioner clinics',
    seatRange: { min: 11, max: 50 },
    features: [
      '11–50 clinician seats',
      'Everything in Clinic',
      'Volume pricing',
      'Dedicated onboarding',
      'Custom note templates',
      'API access',
      'Audit log exports',
    ],
  },
} as const;

type PlanKey = keyof typeof PLANS;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get('plan') as PlanKey | null;
  const canceled = searchParams.get('canceled') === 'true';

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(
    planParam && planParam in PLANS ? planParam : 'solo'
  );
  const [seats, setSeats] = useState<number>(PLANS[selectedPlan].seatRange.min);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = PLANS[selectedPlan];
  const showSeatSelector = selectedPlan !== 'solo';
  const totalPrice = selectedPlan === 'solo'
    ? 149
    : (selectedPlan === 'clinic' ? 119 : 99) * seats;

  function handlePlanChange(key: PlanKey) {
    setSelectedPlan(key);
    setSeats(PLANS[key].seatRange.min);
  }

  async function handleCheckout() {
    setLoading(true);
    setError('');

    try {
      // Recover the referral slug if the visitor came through /r/<slug>.
      // /api/stripe/create-checkout maps the slug to its Stripe promo code
      // and applies the 3-months-free discount automatically.
      const referralCode = readReferralCookie();

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          seats,
          ...(referralCode ? { referralCode } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to start checkout');
        setLoading(false);
        return;
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Choose Your Plan"
        description="Select a plan and start your 14-day free trial. Your card will not be charged until the trial ends."
      />

      {canceled && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 text-amber-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Checkout was canceled. You can try again or choose a different plan.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => (
          <button
            key={key}
            onClick={() => handlePlanChange(key)}
            className="text-left w-full"
          >
            <Card
              className={`h-full transition-all ${
                selectedPlan === key
                  ? 'ring-2 ring-secondary shadow-ambient'
                  : 'hover:shadow-ambient-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-on-surface">{p.name}</h3>
                {selectedPlan === key && (
                  <CheckCircle className="w-5 h-5 text-secondary" />
                )}
              </div>
              <p className="text-xs text-on-surface-variant mb-4">{p.description}</p>
              <p className="text-2xl font-bold text-on-surface mb-4">
                {p.price}
                <span className="text-sm font-normal text-on-surface-variant">{p.period}</span>
              </p>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-on-surface-variant flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </button>
        ))}
      </div>

      {/* Seat selector + checkout */}
      <Card className="max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-on-surface mb-4">
          {plan.name} Plan
        </h3>

        {showSeatSelector && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-on-surface mb-2">
              Number of clinician seats
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={plan.seatRange.min}
                max={plan.seatRange.max}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="flex-1 accent-secondary"
              />
              <span className="text-lg font-bold text-on-surface w-12 text-right">
                {seats}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {plan.seatRange.min}–{plan.seatRange.max} seats available
            </p>
          </div>
        )}

        <div className="flex items-center justify-between py-4 border-t border-outline-variant/20">
          <div>
            <p className="text-sm text-on-surface-variant">Monthly total</p>
            <p className="text-2xl font-bold text-on-surface">
              ${totalPrice}
              <span className="text-sm font-normal text-on-surface-variant">/month</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary font-medium">14-day free trial</p>
            <p className="text-xs text-on-surface-variant">Cancel anytime</p>
          </div>
        </div>

        <Button
          className="w-full mt-4"
          size="lg"
          onClick={handleCheckout}
          isLoading={loading}
        >
          Start Free Trial
        </Button>

        <p className="text-xs text-center text-on-surface-variant mt-4">
          You will be redirected to Stripe to enter your payment details.
          Your card will not be charged during the 14-day trial.
        </p>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}

/**
 * Reads the `miraa_ref` cookie set by `/r/<slug>`. We use a cookie (not
 * just a query param) so the referral survives OAuth redirects and the
 * email-verification round-trip.
 */
function readReferralCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const target = 'miraa_ref=';
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }
  return null;
}
