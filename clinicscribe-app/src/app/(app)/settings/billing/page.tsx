'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { CreditCard, Calendar, Users, ArrowRight } from 'lucide-react';

const TIER_LABELS: Record<string, string> = {
  solo: 'Solo',
  clinic: 'Clinic',
  group: 'Group Practice',
  enterprise: 'Enterprise',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  trialing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
  past_due: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Past Due' },
  canceled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Canceled' },
  none: { bg: 'bg-surface-container-high', text: 'text-outline', label: 'No Subscription' },
};

export default function BillingPage() {
  const clinic = useAuthStore((s) => s.clinic);
  const [portalLoading, setPortalLoading] = useState(false);

  const tier = clinic?.subscription_tier || 'solo';
  const status = clinic?.stripe_subscription_status || 'none';
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.none;
  const hasSubscription = clinic?.stripe_customer_id && status !== 'none';

  async function openBillingPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch {
      setPortalLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Subscription & Billing"
        description="Manage your plan, seats, and payment method."
      />

      <div className="max-w-2xl space-y-6">
        {/* Current Plan */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-on-surface">Current Plan</h3>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Plan</p>
                <p className="text-sm font-semibold text-on-surface">
                  {TIER_LABELS[tier] || tier}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Seats</p>
                <p className="text-sm font-semibold text-on-surface">
                  {clinic?.subscription_seats ?? 1}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">
                  {status === 'trialing' ? 'Trial Ends' : 'Renews'}
                </p>
                <p className="text-sm font-semibold text-on-surface">
                  {status === 'trialing' && clinic?.trial_ends_at
                    ? new Date(clinic.trial_ends_at).toLocaleDateString()
                    : clinic?.subscription_period_end
                      ? new Date(clinic.subscription_period_end).toLocaleDateString()
                      : '—'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card>
          {hasSubscription ? (
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant">
                Manage your subscription, update your payment method, or cancel
                through the Stripe billing portal.
              </p>
              <Button
                onClick={openBillingPortal}
                isLoading={portalLoading}
                size="lg"
              >
                Manage Subscription
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant">
                You don&apos;t have an active subscription. Choose a plan to get
                started with a 14-day free trial.
              </p>
              <Link href="/checkout">
                <Button size="lg">
                  Choose a Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
