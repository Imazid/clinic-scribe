'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Mic,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type StepId = 'account' | 'practice' | 'emr' | 'voice' | 'safety' | 'first-consult';

interface StepDef {
  id: StepId;
  index: string;
  title: string;
  short: string;
}

const STEPS: StepDef[] = [
  { id: 'account', index: '01', title: 'Account', short: 'Profile basics' },
  { id: 'practice', index: '02', title: 'Practice details', short: 'Clinic info' },
  { id: 'emr', index: '03', title: 'Connect EMR', short: 'Where notes flow' },
  { id: 'voice', index: '04', title: 'Voice & house style', short: 'How drafts read' },
  { id: 'safety', index: '05', title: 'AI safety', short: 'Review gates' },
  { id: 'first-consult', index: '06', title: 'First consultation', short: 'Take it for a spin' },
];

const EMR_OPTIONS: Array<{
  id: string;
  name: string;
  detail: string;
  letters: string;
  recommended?: boolean;
}> = [
  { id: 'best-practice', name: 'Best Practice', detail: 'Direct API · Auto-sync', letters: 'BP', recommended: true },
  { id: 'medical-director', name: 'Medical Director', detail: 'Direct API · Auto-sync', letters: 'MD' },
  { id: 'genie', name: 'Genie Solutions', detail: 'Direct API', letters: 'GS' },
  { id: 'cliniko', name: 'Helix · Cliniko', detail: 'Direct API', letters: 'HX' },
  { id: 'other', name: 'Other / Custom', detail: 'Copy-paste workflow', letters: '··' },
  { id: 'none', name: 'No EMR yet', detail: 'Use Miraa standalone', letters: 'Ø' },
];

const HOUSE_STYLES: Array<{
  id: string;
  eyebrow: string;
  name: string;
  tone: string;
  sample: string;
}> = [
  {
    id: 'crisp',
    eyebrow: 'House',
    name: 'Crisp clinical',
    tone: 'Concise, structured SOAP. No filler.',
    sample: '"Px reports 3/7 H/A, R-sided, throbbing, 6/10. No N/V. PMHx unremarkable."',
  },
  {
    id: 'natural',
    eyebrow: 'Recommended',
    name: 'Natural plain',
    tone: 'Full sentences, plain English, easy to read.',
    sample:
      '"Patient describes a 3-day history of right-sided throbbing headache, rated 6/10, with no nausea."',
  },
  {
    id: 'narrative',
    eyebrow: 'Editorial',
    name: 'Narrative',
    tone: 'Patient-first paragraphs, longer prose.',
    sample:
      '"Adina presents today with a three-day history of right-sided throbbing headache, rated 6/10…"',
  },
];

const STORAGE_KEY = 'miraa.onboarding.v1';

interface OnboardingState {
  completed: StepId[];
  emr: string | null;
  houseStyle: string;
  practiceLocation: string;
  practitionerId: string;
  reviewGate: 'mandatory' | 'recommended';
}

const DEFAULT_STATE: OnboardingState = {
  completed: [],
  emr: null,
  houseStyle: 'natural',
  practiceLocation: '',
  practitionerId: '',
  reviewGate: 'mandatory',
};

function loadState(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function persist(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  );
}

function OnboardingInner() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<StepId>('account');
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; clinic_name?: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
    // Best-effort profile read (skipped if not signed in yet — onboarding is reachable post-signup)
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const meta = user.user_metadata as Record<string, string> | null;
        setProfile({
          first_name: meta?.first_name,
          last_name: meta?.last_name,
          clinic_name: meta?.clinic_name,
        });
      } catch {
        /* not signed in — keep going as a guided tour */
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrated) persist(state);
  }, [state, hydrated]);

  const activeIndex = STEPS.findIndex((s) => s.id === activeStep);
  const completedCount = state.completed.length;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  function markCompleted(step: StepId) {
    setState((prev) =>
      prev.completed.includes(step)
        ? prev
        : { ...prev, completed: [...prev.completed, step] },
    );
  }

  async function finishOnboarding() {
    // Stamp the profile so future logins skip the wizard. We don't block on
    // this — even if the write fails the user still proceeds to /dashboard,
    // and we keep the localStorage state so the wizard remains skippable.
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    } catch {
      /* non-fatal — proceed to dashboard either way */
    }
    router.push('/dashboard');
  }

  function goNext() {
    markCompleted(activeStep);
    const nextIndex = activeIndex + 1;
    if (nextIndex >= STEPS.length) {
      void finishOnboarding();
      return;
    }
    setActiveStep(STEPS[nextIndex].id);
  }

  function goBack() {
    if (activeIndex === 0) return;
    setActiveStep(STEPS[activeIndex - 1].id);
  }

  function skip() {
    const idx = STEPS.findIndex((s) => s.id === activeStep);
    const nextIndex = idx + 1;
    if (nextIndex >= STEPS.length) {
      void finishOnboarding();
      return;
    }
    setActiveStep(STEPS[nextIndex].id);
  }

  const stepContent = useMemo(() => {
    switch (activeStep) {
      case 'account':
        return <AccountStep profile={profile} />;
      case 'practice':
        return (
          <PracticeStep
            location={state.practiceLocation}
            practitionerId={state.practitionerId}
            onLocationChange={(v) => setState((s) => ({ ...s, practiceLocation: v }))}
            onPractitionerIdChange={(v) =>
              setState((s) => ({ ...s, practitionerId: v }))
            }
          />
        );
      case 'emr':
        return (
          <EmrStep
            value={state.emr}
            onChange={(emr) => setState((s) => ({ ...s, emr }))}
          />
        );
      case 'voice':
        return (
          <VoiceStep
            value={state.houseStyle}
            onChange={(houseStyle) => setState((s) => ({ ...s, houseStyle }))}
          />
        );
      case 'safety':
        return (
          <SafetyStep
            value={state.reviewGate}
            onChange={(reviewGate) => setState((s) => ({ ...s, reviewGate }))}
          />
        );
      case 'first-consult':
        return <FirstConsultStep />;
    }
  }, [activeStep, state, profile]);

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface text-on-surface lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* Rail */}
      <aside className="hidden flex-col border-r border-outline-variant bg-surface-container-lowest px-6 py-8 lg:flex">
        <Link href="/" className="mb-9 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary font-display text-lg font-bold italic text-on-secondary">
            m
          </div>
          <span className="text-[13px] font-semibold tracking-tight">Miraa setup</span>
        </Link>

        <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.10em] text-outline">
          Your setup · {progressPercent}%
        </p>

        <ol className="flex flex-col gap-1.5">
          {STEPS.map((step) => {
            const done = state.completed.includes(step.id);
            const active = activeStep === step.id;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    active && 'bg-secondary/10',
                    !active && 'hover:bg-surface-container-low',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold',
                      done && 'bg-success text-on-secondary',
                      !done &&
                        active &&
                        'bg-secondary text-on-secondary',
                      !done && !active && 'border border-outline-variant bg-surface-container-lowest text-outline',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : step.index}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        'text-[13px]',
                        active ? 'font-bold text-on-surface' : done ? 'text-outline' : 'font-medium text-on-surface',
                      )}
                    >
                      {step.title}
                    </div>
                    <div className="text-[11px] text-outline">{step.short}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-auto rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <p className="text-xs font-bold text-on-surface">Need a hand?</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
            Book a 15-minute onboarding call. We&apos;ll walk through your EMR setup live.
          </p>
          <Link
            href="mailto:hello@miraahealth.com.au"
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-xs font-semibold text-on-surface hover:border-secondary/30 hover:text-secondary"
          >
            <PhoneCall className="h-3 w-3" /> Book a call
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="overflow-auto px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
            Step {STEPS[activeIndex].index} of {String(STEPS.length).padStart(2, '0')}
          </div>
          <h1 className="m-0 font-display text-[44px] font-semibold leading-[1.05] tracking-[-0.025em]">
            {stepHeadline(activeStep)}
          </h1>
          <p className="mt-2.5 max-w-[540px] text-[15px] leading-relaxed text-on-surface-variant">
            {stepLede(activeStep)}
          </p>

          <div className="mt-8">{stepContent}</div>

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goBack}
              disabled={activeIndex === 0}
            >
              Back
            </Button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={skip}
                className="h-12 rounded-xl px-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
              >
                Skip for now
              </button>
              <Button type="button" size="lg" onClick={goNext}>
                {activeIndex === STEPS.length - 1 ? 'Open dashboard' : 'Continue'}{' '}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ----------------------------------------------------------- */
/* Step renderers                                              */
/* ----------------------------------------------------------- */

function stepHeadline(step: StepId): React.ReactNode {
  switch (step) {
    case 'account':
      return (
        <>
          Welcome to <span className="italic text-secondary">Miraa</span>.
        </>
      );
    case 'practice':
      return (
        <>
          Tell us about your <span className="italic text-secondary">practice</span>.
        </>
      );
    case 'emr':
      return (
        <>
          Connect your <span className="italic text-secondary">EMR</span>.
        </>
      );
    case 'voice':
      return (
        <>
          Pick your <span className="italic text-secondary">house style</span>.
        </>
      );
    case 'safety':
      return (
        <>
          Set the <span className="italic text-secondary">review gates</span>.
        </>
      );
    case 'first-consult':
      return (
        <>
          Take it for a <span className="italic text-secondary">spin</span>.
        </>
      );
  }
}

function stepLede(step: StepId): string {
  switch (step) {
    case 'account':
      return 'Confirm the basics. We pre-filled what you gave us during signup.';
    case 'practice':
      return 'Used on every prescription, referral, and exported note.';
    case 'emr':
      return "Approved notes flow back into the patient's record. We never write to the EMR without you signing off.";
    case 'voice':
      return "We'll mirror this voice in every draft. You can change it later for a single patient or for the whole clinic.";
    case 'safety':
      return 'Decide how strict the review gate is before AI output leaves the system. You can tighten this later but never loosen it without a re-onboard.';
    case 'first-consult':
      return 'You\'re ready. Walk into your next consultation and let Miraa draft the note while you focus on the patient.';
  }
}

function AccountStep({
  profile,
}: {
  profile: { first_name?: string; last_name?: string; clinic_name?: string } | null;
}) {
  const fullName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : '';
  const clinicName = profile?.clinic_name ?? '';
  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="full_name" label="Your name" value={fullName} disabled />
        <Input id="clinic_name" label="Clinic" value={clinicName} disabled />
      </div>
      <p className="mt-4 text-xs text-outline">
        Need to fix this? You can edit your profile later in Settings → Profile.
      </p>
    </div>
  );
}

function PracticeStep({
  location,
  practitionerId,
  onLocationChange,
  onPractitionerIdChange,
}: {
  location: string;
  practitionerId: string;
  onLocationChange: (v: string) => void;
  onPractitionerIdChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="practice_location"
          label="Primary location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Surry Hills clinic"
        />
        <Input
          id="practitioner_id"
          label="Practitioner / provider number"
          value={practitionerId}
          onChange={(e) => onPractitionerIdChange(e.target.value)}
          placeholder="MAZID-IH-04221"
        />
      </div>
      <p className="mt-4 inline-flex items-center gap-2 text-xs text-on-surface-variant">
        <Building2 className="h-3.5 w-3.5 text-secondary" />
        We&apos;ll print this on prescriptions and referrals.
      </p>
    </div>
  );
}

function EmrStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {EMR_OPTIONS.map((emr) => {
        const selected = value === emr.id;
        return (
          <button
            key={emr.id}
            type="button"
            onClick={() => onChange(selected ? null : emr.id)}
            className={cn(
              'flex items-center gap-3.5 rounded-2xl border bg-surface-container-lowest px-4 py-4 text-left transition-all',
              selected
                ? 'border-secondary shadow-ambient-sm'
                : 'border-outline-variant/60 hover:border-secondary/40',
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-on-secondary',
                selected ? 'bg-secondary' : 'bg-outline/70',
              )}
            >
              {emr.letters}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-on-surface">{emr.name}</span>
                {emr.recommended && (
                  <span className="rounded bg-success/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-success">
                    Recommended
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-outline">{emr.detail}</p>
            </div>
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                selected
                  ? 'border-secondary bg-secondary text-on-secondary'
                  : 'border-outline-variant',
              )}
            >
              {selected && <Check className="h-3 w-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function VoiceStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {HOUSE_STYLES.map((style) => {
        const selected = value === style.id;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={cn(
              'relative flex flex-col items-start rounded-2xl border bg-surface-container-lowest p-6 text-left transition-all',
              selected
                ? 'border-secondary shadow-ambient -translate-y-0.5'
                : 'border-outline-variant/60 hover:-translate-y-0.5',
            )}
          >
            {selected && (
              <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-on-secondary">
                <Check className="h-2.5 w-2.5" /> Selected
              </div>
            )}
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-outline">
              {style.eyebrow}
            </div>
            <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-on-surface">
              {style.name}
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-on-surface-variant">{style.tone}</p>
            <div className="mt-4 w-full rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5 font-display text-[13px] italic leading-relaxed text-on-surface-variant">
              {style.sample}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SafetyStep({
  value,
  onChange,
}: {
  value: 'mandatory' | 'recommended';
  onChange: (v: 'mandatory' | 'recommended') => void;
}) {
  const choices: Array<{
    id: 'mandatory' | 'recommended';
    title: string;
    body: string;
    icon: LucideIcon;
  }> = [
    {
      id: 'mandatory',
      title: 'Mandatory clinician sign-off',
      body: 'Every AI output must be reviewed and approved before it leaves Miraa. This is the recommended posture for clinical practice.',
      icon: ShieldCheck,
    },
    {
      id: 'recommended',
      title: 'Strongly recommended',
      body: 'Outputs default to draft and surface flags inline. Clinicians can opt to bulk-approve a queue when comfortable.',
      icon: Workflow,
    },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {choices.map((c) => {
          const selected = value === c.id;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={cn(
                'rounded-2xl border bg-surface-container-lowest p-5 text-left transition-all',
                selected
                  ? 'border-secondary shadow-ambient-sm'
                  : 'border-outline-variant/60 hover:border-secondary/40',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-secondary" />
                <h3 className="text-sm font-bold text-on-surface">{c.title}</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{c.body}</p>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] leading-relaxed text-outline">
        Per Miraa&apos;s clinical safety constraints — AI-generated notes are always described
        as &quot;clinician-reviewed before finalisation&quot; and prescription support is
        drafting assistance only.
      </p>
    </div>
  );
}

function FirstConsultStep() {
  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
        <Stethoscope className="h-7 w-7" />
      </div>
      <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
        You&apos;re ready.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
        Walk into your next consultation. Tap the mic. Miraa will draft the note while you focus
        on the patient — you stay in control of the sign-off.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:text-left">
        {[
          { icon: Mic, t: 'Capture', s: 'Live transcript with consent banner' },
          { icon: Sparkles, t: 'Draft', s: 'AI structures the SOAP note' },
          { icon: CheckCircle2, t: 'Sign off', s: 'Approve or edit before export' },
        ].map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.t}
              className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4"
            >
              <Icon className="mb-2 h-4 w-4 text-secondary" />
              <p className="text-sm font-bold text-on-surface">{step.t}</p>
              <p className="mt-0.5 text-xs leading-snug text-on-surface-variant">{step.s}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

