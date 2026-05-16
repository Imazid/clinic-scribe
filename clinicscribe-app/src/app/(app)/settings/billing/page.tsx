'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Download, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Billing & subscription — pixel-faithful to the design's `BillingScreen`.
 *
 * Real data:
 *   - tier / status / seats / renewal date — from `useAuthStore().clinic`
 *   - Manage subscription / Update payment → POST /api/stripe/portal
 *   - "Choose a plan" CTA for no-subscription state → /checkout
 *
 * Mocked (display only — needs Stripe metering for real numbers):
 *   - usage donut (consults this month vs. cap)
 *   - invoices list (would come from Stripe `invoices.list` once wired)
 */

const TIER_LABELS: Record<string, string> = {
  solo: 'Miraa Solo',
  clinic: 'Miraa Clinic',
  group: 'Miraa Group Practice',
  enterprise: 'Miraa Enterprise',
};

const TIER_PRICES: Record<string, { price: string; period: string }> = {
  solo:        { price: '$89',  period: '/month' },
  clinic:      { price: '$59',  period: '/month / clinician' },
  group:       { price: '$49',  period: '/month / clinician' },
  enterprise:  { price: 'Custom', period: '' },
};

const STATUS_LABEL: Record<string, { label: string; tone: 'success' | 'info' | 'warning' | 'error' | 'default' }> = {
  active:    { label: 'Active',    tone: 'success' },
  trialing:  { label: 'Trial',     tone: 'info' },
  past_due:  { label: 'Past due',  tone: 'warning' },
  canceled:  { label: 'Canceled',  tone: 'error' },
  none:      { label: 'No subscription', tone: 'default' },
};

export default function BillingPage() {
  const clinic = useAuthStore((s) => s.clinic);
  const [portalLoading, setPortalLoading] = useState(false);

  const tier = clinic?.subscription_tier || 'solo';
  const status = clinic?.stripe_subscription_status || 'none';
  const statusInfo = STATUS_LABEL[status] || STATUS_LABEL.none;
  const hasSubscription = Boolean(clinic?.stripe_customer_id) && status !== 'none';

  const planName = TIER_LABELS[tier] ?? tier;
  const planPricing = TIER_PRICES[tier] ?? { price: '—', period: '' };

  const renewDate = useMemo(() => {
    const iso = status === 'trialing' ? clinic?.trial_ends_at : clinic?.subscription_period_end;
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [clinic?.trial_ends_at, clinic?.subscription_period_end, status]);

  // Mock usage; once Stripe metering is wired, swap for an /api/billing/usage call.
  const usage = { used: 248, cap: 400 };
  const usagePct = Math.min(1, usage.used / usage.cap);

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
        return;
      }
    } catch {
      /* fall through */
    }
    setPortalLoading(false);
  }

  return (
    <div className="space-y-6">
        {/* Hero — current plan + usage donut */}
        <div
          className="mb-6 grid gap-7 rounded-[22px] border border-outline-variant/40 p-7 lg:grid-cols-[1.4fr_1fr] lg:items-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-surface-container-lowest) 0%, var(--color-surface) 100%)',
          }}
        >
          <div>
            <StatusChip tone={statusInfo.tone}>{statusInfo.label}</StatusChip>
            <div className="mt-2.5 flex items-baseline gap-2.5">
              <h2 className="font-display text-[36px] font-semibold leading-none tracking-[-0.025em]">
                {planName}
              </h2>
              <span className="text-[14px] text-on-surface-variant">
                · {planPricing.price}{planPricing.period}
              </span>
            </div>
            <p className="mt-1.5 max-w-[460px] text-[13px] text-on-surface-variant">
              {status === 'trialing' && renewDate
                ? `Trial ends ${renewDate}. No card charged until then.`
                : renewDate
                  ? `Renews ${renewDate}.`
                  : hasSubscription
                    ? 'Active subscription.'
                    : 'No active subscription.'}
              {clinic?.subscription_seats && clinic.subscription_seats > 1
                ? ` ${clinic.subscription_seats} seats.`
                : ''}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {hasSubscription ? (
                <>
                  <button
                    type="button"
                    onClick={openBillingPortal}
                    disabled={portalLoading}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-on-surface px-4 text-[13px] font-bold text-surface transition-colors hover:bg-on-surface/90 disabled:opacity-60"
                  >
                    {portalLoading ? 'Opening…' : 'Manage subscription'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    href="/checkout"
                    className="inline-flex h-10 items-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-[13px] font-semibold hover:bg-surface-container"
                  >
                    Compare plans
                  </Link>
                </>
              ) : (
                <Link
                  href="/checkout"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-on-surface px-4 text-[13px] font-bold text-surface hover:bg-on-surface/90"
                >
                  Start your trial
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Usage donut */}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p className="eyebrow mb-3 text-on-surface-variant">This month</p>
            <div className="flex items-center gap-3.5">
              <DonutRing pct={usagePct} />
              <div>
                <p className="font-display text-[26px] font-semibold leading-none tracking-[-0.02em]">
                  {usage.used}
                </p>
                <p className="text-[11px] text-on-surface-variant">of {usage.cap} consults</p>
                <p className="mt-1 text-[11px] font-semibold text-secondary">~6 hrs/week saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan grid */}
        <p className="eyebrow mb-2.5 text-secondary">Plans</p>
        <div className="mb-7 grid gap-3.5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const current = plan.tierKey === tier;
            return (
              <PlanCard
                key={plan.name}
                plan={plan}
                current={current}
                onSelect={current ? undefined : () => (window.location.href = '/checkout')}
              />
            );
          })}
        </div>

        {/* Payment + invoices */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          {/* Payment method */}
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient-sm">
            <p className="eyebrow mb-3 text-on-surface-variant">Payment method</p>
            <div
              className="relative overflow-hidden rounded-xl p-4 text-white"
              style={{
                background: 'linear-gradient(135deg, #001736 0%, #1F3F58 100%)',
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.06]"
              />
              <p className="font-mono text-[16px] tracking-[0.08em]">•••• •••• •••• 4242</p>
              <p className="mt-2.5 text-[11px] text-white/70">
                {hasSubscription ? 'Managed in Stripe portal' : 'No card on file'}
              </p>
            </div>
            <button
              type="button"
              onClick={openBillingPortal}
              disabled={!hasSubscription || portalLoading}
              className="mt-3 h-9 w-full rounded-lg border border-outline-variant/40 bg-surface text-[12px] font-semibold transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasSubscription ? 'Update card' : 'Add a card to start'}
            </button>
          </div>

          {/* Invoices */}
          <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/40 px-6 py-4">
              <p className="eyebrow text-on-surface-variant">Invoices</p>
              <button
                type="button"
                onClick={openBillingPortal}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-secondary hover:underline"
              >
                <Download className="h-3 w-3" />
                Download all
              </button>
            </div>
            <div className="px-6 py-4">
              {SAMPLE_INVOICES.map((inv, idx) => (
                <div
                  key={inv.id}
                  className={
                    'grid grid-cols-[1.4fr_1fr_1fr_80px] items-center gap-2.5 py-2.5 text-[13px]' +
                    (idx < SAMPLE_INVOICES.length - 1 ? ' border-b border-outline-variant/40' : '')
                  }
                >
                  <div className="font-mono text-[12px] text-on-surface-variant">{inv.id}</div>
                  <div className="text-[12px] text-on-surface-variant">{inv.date}</div>
                  <div className={'font-bold ' + (inv.credited ? 'text-success' : '')}>{inv.amount}</div>
                  <button
                    type="button"
                    onClick={openBillingPortal}
                    className="inline-flex items-center justify-end gap-1 text-right text-[12px] font-semibold text-secondary hover:underline"
                  >
                    <FileText className="h-3 w-3" />
                    PDF
                  </button>
                </div>
              ))}
              <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant">
                Invoices are managed by Stripe. Use &ldquo;Manage subscription&rdquo; above to view the
                full ledger and download PDFs.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}

/* ─── Plans ─────────────────────────────────────────────────────────────── */

const PLANS: Array<{
  name: string;
  tierKey: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
}> = [
  {
    name: 'Trial',
    tierKey: 'trial',
    price: '$0',
    period: 'For 14 days',
    features: ['Unlimited consults', 'All AI safety', 'No card on file'],
  },
  {
    name: 'Solo',
    tierKey: 'solo',
    price: '$89',
    period: '/month',
    features: ['Unlimited consults', 'EMR sync · BP / MD / Genie', 'Email + chat support'],
  },
  {
    name: 'Clinic',
    tierKey: 'clinic',
    price: '$59',
    period: '/month / clinician',
    features: ['Everything in Solo', 'Team workspace · audit', 'Priority support · SSO'],
    featured: true,
  },
];

function PlanCard({
  plan,
  current,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  current: boolean;
  onSelect?: () => void;
}) {
  const featured = plan.featured;
  return (
    <div
      className={
        'relative rounded-[18px] border-[1.5px] p-6 ' +
        (featured
          ? 'bg-on-surface text-surface border-on-surface'
          : current
            ? 'border-secondary bg-surface-container-lowest'
            : 'border-outline-variant bg-surface-container-lowest')
      }
    >
      {featured && (
        <span className="absolute -top-2.5 right-5 rounded-full bg-warning px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Best value
        </span>
      )}
      <p
        className={
          'text-[12px] font-bold uppercase tracking-[0.08em] ' +
          (featured ? 'text-surface/60' : 'text-on-surface-variant')
        }
      >
        {plan.name}
      </p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-[40px] font-semibold leading-none tracking-[-0.03em]">
          {plan.price}
        </span>
        <span className={'text-[12px] ' + (featured ? 'text-surface/60' : 'text-on-surface-variant')}>
          {plan.period}
        </span>
      </div>
      <div className="mt-3.5 flex flex-col gap-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-[13px]">
            <Check
              className={'h-3.5 w-3.5 shrink-0 ' + (featured ? 'text-[#E8DBC8]' : 'text-success')}
              strokeWidth={2.6}
            />
            <span>{f}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onSelect}
        disabled={current}
        className={
          'mt-4 h-10 w-full rounded-xl text-[13px] font-bold transition-colors ' +
          (current
            ? featured
              ? 'border border-surface/20 text-surface/70'
              : 'border border-outline-variant/40 text-on-surface-variant'
            : featured
              ? 'bg-surface text-on-surface hover:bg-surface/90'
              : 'bg-on-surface text-surface hover:bg-on-surface/90')
        }
      >
        {current ? 'Current plan' : featured ? 'Upgrade' : 'Choose'}
      </button>
    </div>
  );
}

/* ─── Pieces ────────────────────────────────────────────────────────────── */

function StatusChip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'success' | 'info' | 'warning' | 'error' | 'default';
}) {
  const styles: Record<typeof tone, string> = {
    success: 'bg-success/10 text-success',
    info:    'bg-secondary/10 text-secondary',
    warning: 'bg-warning/10 text-warning',
    error:   'bg-error/10 text-error',
    default: 'bg-surface-container text-on-surface-variant',
  };
  const dotColor: Record<typeof tone, string> = {
    success: 'bg-success',
    info:    'bg-secondary',
    warning: 'bg-warning',
    error:   'bg-error',
    default: 'bg-on-surface-variant',
  };
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ' + styles[tone]}>
      <span className={'h-1.5 w-1.5 rounded-full ' + dotColor[tone]} />
      {children}
    </span>
  );
}

function DonutRing({ pct }: { pct: number }) {
  const R = 28;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct);
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
      <circle cx="38" cy="38" r={R} fill="none" stroke="var(--color-outline-variant)" strokeWidth="8" />
      <circle
        cx="38"
        cy="38"
        r={R}
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform="rotate(-90 38 38)"
      />
      <text
        x="38"
        y="42"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fontFamily="var(--font-display)"
        fill="var(--color-on-surface)"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

const SAMPLE_INVOICES = [
  { id: 'INV-2026-014', date: '22 Apr 2026', amount: '$0.00 credited', credited: true },
  { id: 'INV-2026-013', date: '22 Mar 2026', amount: '$89.00',          credited: false },
  { id: 'INV-2026-012', date: '22 Feb 2026', amount: '$89.00',          credited: false },
  { id: 'INV-2026-011', date: '22 Jan 2026', amount: '$89.00',          credited: false },
];
