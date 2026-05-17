'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/Toggle';
import {
  AlertTriangle,
  CircleHelp,
  Lock,
  Pill,
  Sparkles,
  UserX,
  ShieldCheck,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Tone = 'strict' | 'balanced' | 'free';

interface Guardrail {
  key: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  defaultOn: boolean;
  locked?: boolean;
}

const GUARDRAILS: Guardrail[] = [
  {
    key: 'drug-interactions',
    icon: AlertTriangle,
    label: 'Flag drug interactions',
    desc: 'Surface critical and major interaction warnings inline on draft prescriptions.',
    defaultOn: true,
    locked: true,
  },
  {
    key: 'dose-discrepancies',
    icon: Pill,
    label: 'Flag dose discrepancies',
    desc: 'Highlight doses that fall outside common ranges for the indication.',
    defaultOn: true,
  },
  {
    key: 'unverified-history',
    icon: CircleHelp,
    label: 'Highlight unverified history',
    desc: 'Mark history items in the draft that weren’t corroborated by the transcript.',
    defaultOn: true,
  },
  {
    key: 'auto-redact',
    icon: UserX,
    label: 'Auto-redact identifiers',
    desc: 'Replace direct identifiers in any de-identified sample we keep for QA.',
    defaultOn: false,
  },
  {
    key: 'block-signoff',
    icon: Lock,
    label: 'Block sign-off with unresolved flags',
    desc: 'Approval is disabled until every critical QA finding is resolved.',
    defaultOn: true,
    locked: true,
  },
];

export default function SettingsAISafetyPage() {
  const [tone, setTone] = useState<Tone>('balanced');
  const [guardrails, setGuardrails] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GUARDRAILS.map((g) => [g.key, g.defaultOn])),
  );

  return (
    <div className="space-y-6">
      {/* Sign-off contract */}
      <div
        className="relative overflow-hidden rounded-2xl border-[1.5px] p-6"
        style={{
          background:
            'linear-gradient(135deg, var(--color-tertiary-container) 0%, var(--color-surface-container-low) 100%)',
          borderColor: 'var(--color-tertiary-container)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tertiary/15 text-tertiary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--color-tertiary)' }}
            >
              The sign-off contract
            </p>
            <h3 className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-on-surface">
              Miraa drafts.{' '}
              <span
                className="italic"
                style={{ color: 'var(--color-tertiary)' }}
              >
                You decide.
              </span>
            </h3>
            <p className="mt-2 max-w-2xl text-[13px] leading-[1.55] text-on-surface-variant">
              Every clinical note, prescription, and patient communication waits for your review and
              signature. Miraa never sends, prescribes, or finalises on your behalf. The guardrails
              below define what we will and won&apos;t do while you&apos;re reviewing.
            </p>
          </div>
        </div>
      </div>

      {/* Guardrails */}
      <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-ambient-sm">
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant/60 px-6 py-4">
          <div>
            <p className="eyebrow">Guardrails</p>
            <p className="mt-1 text-[15px] font-semibold text-on-surface">Always-on safety rules</p>
          </div>
          <span className="rounded-full bg-secondary-fixed px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
            {Object.values(guardrails).filter(Boolean).length}/{GUARDRAILS.length} active
          </span>
        </div>
        <ul>
          {GUARDRAILS.map((g, i) => {
            const Icon = g.icon;
            const on = guardrails[g.key];
            return (
              <li
                key={g.key}
                className={cn(
                  'flex items-center gap-4 px-6 py-4',
                  i !== GUARDRAILS.length - 1 && 'border-b border-outline-variant/40',
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-container-low text-secondary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-on-surface">{g.label}</span>
                    {g.locked && (
                      <>
                        <Lock className="h-3 w-3 text-outline" />
                        <span className="rounded-full bg-warning-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
                          Required
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-[1.5] text-on-surface-variant">{g.desc}</p>
                </div>
                <Toggle
                  checked={g.locked ? true : on}
                  onChange={(v) => setGuardrails((p) => ({ ...p, [g.key]: v }))}
                  disabled={g.locked}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {/* Drafting tone */}
      <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-ambient-sm">
        <div className="border-b border-outline-variant/60 px-6 py-4">
          <p className="eyebrow">Drafting tone</p>
          <p className="mt-1 text-[15px] font-semibold text-on-surface">
            How conservative should the draft be?
          </p>
          <p className="mt-1 text-[12px] text-on-surface-variant">
            Sets the AI&apos;s default willingness to make assumptions vs. flag for clinician input.
          </p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3">
          {(
            [
              {
                id: 'strict' as Tone,
                title: 'Strict',
                body: 'Only includes information explicitly stated. Flags everything else.',
              },
              {
                id: 'balanced' as Tone,
                title: 'Balanced',
                body: 'Reasonable inferences from context, with provenance markers.',
              },
              {
                id: 'free' as Tone,
                title: 'Free',
                body: 'Fills gaps with clinical knowledge and high-likelihood inferences.',
              },
            ] as const
          ).map((opt) => {
            const isActive = tone === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTone(opt.id)}
                className={cn(
                  'relative flex flex-col items-start gap-1.5 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors',
                  isActive
                    ? 'border-secondary bg-secondary-fixed'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40',
                )}
              >
                {isActive && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-on-secondary">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <Sparkles className={cn('h-3.5 w-3.5', isActive ? 'text-secondary' : 'text-outline')} />
                  <span
                    className={cn(
                      'text-[13px] font-semibold',
                      isActive ? 'text-secondary' : 'text-on-surface',
                    )}
                  >
                    {opt.title}
                  </span>
                </div>
                <p className="text-[11px] leading-[1.45] text-on-surface-variant">{opt.body}</p>
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-[11px] text-outline">
        These choices are stored on this device while we finalise per-clinic safety policies.
        Required toggles cannot be turned off.
      </p>
    </div>
  );
}
