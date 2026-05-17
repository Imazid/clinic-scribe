'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Eye, EyeOff, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupInput } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { PhoneInput, countryByIso } from '@/components/ui/PhoneInput';

interface InvitationPreview {
  email: string;
  role: string;
  clinicName: string | null;
  expiresAt: string;
}

const STATS = [
  { v: '9.4 hrs', l: 'Saved per clinician / week' },
  { v: '128k', l: 'Notes drafted last month' },
  { v: '99.4%', l: 'Sign-off rate' },
];

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('token');
  // `/r/<slug>` landing forwards these so the signup form can render the
  // "invited by" banner and attach the slug to user metadata.
  const referralSlug = searchParams.get('ref');
  const inviterName = searchParams.get('inviter');
  const [invite, setInvite] = useState<InvitationPreview | null>(null);
  const [inviteError, setInviteError] = useState('');

  const [form, setForm] = useState<SignupInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    country: 'AU',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resentAt, setResentAt] = useState<number | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/invitations/lookup?token=${encodeURIComponent(inviteToken)}`,
        );
        if (cancelled) return;
        const data = await res.json();
        if (!res.ok) {
          setInviteError(data.error || 'Invitation invalid');
          return;
        }
        setInvite(data);
        setForm((f) => ({
          ...f,
          email: data.email,
          clinicName: data.clinicName ?? f.clinicName,
        }));
      } catch {
        if (!cancelled) setInviteError('Could not load invitation');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError('');

    if (!agreedTerms) {
      setErrors({ _terms: 'Please confirm you agree to the Terms.' });
      return;
    }

    const result = signupSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const dial = countryByIso(form.country)?.dial ?? '';
    const fullPhone = form.phone.startsWith('+')
      ? form.phone
      : `${dial}${form.phone.replace(/\s/g, '')}`;
    // Pull a referral slug from the URL first, fall back to the cookie
    // set by /r/<slug> so OAuth bounces don't drop it.
    const cookieRef = readCookie('miraa_ref');
    const refSlug = referralSlug ?? cookieRef ?? null;

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          clinic_name: form.clinicName,
          phone: fullPhone,
          country_code: form.country,
          ...(invite && inviteToken ? { invite_token: inviteToken } : {}),
          ...(refSlug ? { referral_slug: refSlug } : {}),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    const emailAlreadyConfirmed = Boolean(
      data.user?.email_confirmed_at ??
      (data.user as { confirmed_at?: string | null } | null)?.confirmed_at
    );
    if (data.session || emailAlreadyConfirmed) {
      router.push('/onboarding');
      router.refresh();
      return;
    }

    // Email confirmation is required before the session goes live, so stay on
    // this page and surface a "verify your email" success state. The user
    // clicks the email link → lands on `/login` → first sign-in pulls them
    // through `/onboarding`. This avoids the half-confirmed state where the
    // user could touch the app without a verified email.
    setSubmittedEmail(form.email);
    setLoading(false);
  }

  async function handleResend() {
    if (!submittedEmail || resending) return;
    setResending(true);
    setResendError(null);
    try {
      // Server-side route applies dual-budget rate limiting (per-email +
      // per-IP) so the client can't spam SMTP. The endpoint always returns
      // 200, so we treat any non-200 as a transport problem.
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Too many resend attempts. Try again in a few minutes.");
        }
        throw new Error('Could not resend.');
      }
      setResentAt(Date.now());
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Could not resend.');
    } finally {
      setResending(false);
    }
  }

  function update<K extends keyof SignupInput>(field: K, value: SignupInput[K]) {
    setForm({ ...form, [field]: value });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Left — magazine column */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-container-high px-12 py-12 lg:flex">
        <div>
          <div className="mb-14 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-on-surface font-display text-lg font-bold italic text-surface">
              m
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-on-surface">
              Miraa
            </span>
          </div>

          <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
            Issue 09 · {new Date().toLocaleDateString('en-AU', { month: 'long' })}
          </div>
          <h1
            className="m-0 font-display font-medium leading-[0.92] tracking-[-0.04em] text-on-surface"
            style={{ fontSize: 'clamp(56px, 6.5vw, 84px)' }}
          >
            Notes that
            <br />
            <span className="italic">write themselves.</span>
          </h1>
          <p className="mt-6 max-w-[380px] text-base leading-relaxed text-on-surface-variant">
            Be present. Talk to your patient. Walk out with a draft note ready for review.
          </p>
        </div>

        <div className="flex border-t border-on-surface/15 pt-7">
          {STATS.map((s, i) => (
            <div
              key={s.v}
              className={
                'flex-1 ' +
                (i > 0 ? 'border-l border-on-surface/15 pl-4 ' : 'pr-4')
              }
            >
              <div className="font-display text-[26px] font-semibold tracking-[-0.02em] text-on-surface">
                {s.v}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-on-surface-variant">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* decorative italic m */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-10 select-none font-display text-[360px] font-medium italic leading-none text-on-surface/[0.06]"
        >
          m
        </div>
      </div>

      {/* Right — form column */}
      <div className="relative flex items-start px-6 py-10 sm:px-10 sm:py-14 lg:items-center lg:px-16">
        <div className="absolute right-6 top-6 text-[13px] text-on-surface-variant sm:right-10 sm:top-7">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-secondary hover:underline"
          >
            Sign in
          </Link>
        </div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {submittedEmail ? (
            <VerifyEmailSuccess
              email={submittedEmail}
              onResend={handleResend}
              resending={resending}
              resentAt={resentAt}
              resendError={resendError}
            />
          ) : (
            <>
          {referralSlug && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/8 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-on-surface">
                  {inviterName ? `${inviterName} invited you` : 'You were invited'}
                </p>
                <p className="mt-0.5 text-[12px] text-on-surface-variant">
                  Sign up to claim <span className="font-semibold text-warning">3 months free</span> on top of the 14-day trial.
                </p>
              </div>
            </div>
          )}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            14-day free trial · No card
          </div>

          <h2 className="m-0 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-on-surface">
            {invite ? (
              <>
                Join{' '}
                <span className="italic text-secondary">
                  {invite.clinicName ?? 'your clinic'}
                </span>
              </>
            ) : (
              <>
                Create your <span className="italic text-secondary">workspace</span>
              </>
            )}
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {invite
              ? `You've been invited as ${invite.role}. Set your password to accept.`
              : 'Three minutes to a working scribe. Cancel anytime.'}
          </p>

          {inviteError && (
            <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {inviteError}
            </div>
          )}
          {serverError && (
            <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                id="firstName"
                label="First name"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                error={errors.firstName}
              />
              <Input
                id="lastName"
                label="Last name"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                error={errors.lastName}
              />
            </div>

            {!invite && (
              <Input
                id="clinicName"
                label="Clinic name"
                value={form.clinicName}
                onChange={(e) => update('clinicName', e.target.value)}
                error={errors.clinicName}
                placeholder="Your practice"
              />
            )}

            <Input
              id="email"
              label="Work email"
              type="email"
              placeholder="you@yourclinic.com.au"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              disabled={!!invite}
            />

            <PhoneInput
              country={form.country}
              phone={form.phone}
              onCountryChange={(iso) => update('country', iso)}
              onPhoneChange={(p) => update('phone', p)}
              error={errors.phone || errors.country}
            />

            <Input
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 12 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              error={errors.password}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="rounded p-1 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <AnimatePresence initial={false}>
              {form.password.length > 0 && (
                <motion.div
                  key="meter"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <PasswordStrengthMeter password={form.password} />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              id="confirmPassword"
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="rounded p-1 text-on-surface-variant hover:text-on-surface"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-on-surface-variant">
              <button
                type="button"
                onClick={() => setAgreedTerms((v) => !v)}
                aria-pressed={agreedTerms}
                className={
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ' +
                  (agreedTerms
                    ? 'bg-secondary text-on-secondary'
                    : 'border border-outline-variant bg-surface-container-lowest')
                }
              >
                {agreedTerms && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span>
                I agree to the{' '}
                <Link href="/terms" className="font-semibold text-secondary hover:underline">
                  Terms
                </Link>{' '}
                and confirm I&apos;m a registered healthcare practitioner.
              </span>
            </label>
            {errors._terms && (
              <p className="-mt-1 text-xs text-error">{errors._terms}</p>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full" isLoading={loading}>
              Start your free trial <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-outline">
            Hosted on Australian soil. We never train on your patient data.{' '}
            <Link href="/privacy" className="text-secondary hover:underline">
              Privacy
            </Link>{' '}
            ·{' '}
            <Link href="/terms" className="text-secondary hover:underline">
              Terms
            </Link>
          </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface VerifyEmailSuccessProps {
  email: string;
  onResend: () => void;
  resending: boolean;
  resentAt: number | null;
  resendError: string | null;
}

function VerifyEmailSuccess({
  email,
  onResend,
  resending,
  resentAt,
  resendError,
}: VerifyEmailSuccessProps) {
  const loginHref = `/login?email=${encodeURIComponent(email)}`;
  const forgotPasswordHref = `/forgot-password?email=${encodeURIComponent(email)}`;

  return (
    <div className="relative">
      {/* Animated envelope */}
      <div className="relative inline-flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border border-secondary/30 motion-safe:animate-ping"
          style={{ animationDuration: '2.4s' }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 -m-1 rounded-2xl border border-secondary/40 motion-safe:animate-ping"
          style={{ animationDuration: '2.4s', animationDelay: '0.4s' }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-on-secondary shadow-lg shadow-secondary/25">
          <Mail className="h-7 w-7" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center">
            <span className="absolute h-3 w-3 rounded-full bg-success/40 motion-safe:animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-success" />
          </span>
        </div>
      </div>

      <div className="mb-1.5 mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
        <span className="h-1 w-1 rounded-full bg-secondary" />
        Almost there
      </div>

      <h2 className="m-0 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-on-surface">
        Check your <span className="italic text-secondary">inbox.</span>
      </h2>
      <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-on-surface-variant">
        If this is your first time using{' '}
        <span className="font-semibold text-on-surface">{email}</span> with Miraa,
        a verification link should arrive shortly. If you&apos;ve used this address
        before, sign in or reset your password instead.
      </p>

      <div className="mt-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-outline">
          First time with this email
        </p>
        <ol className="mt-3 space-y-2.5 text-[14px] leading-relaxed text-on-surface">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-[10px] font-bold text-secondary">
              1
            </span>
            <span>
              <strong className="font-semibold">Open your inbox.</strong> Give it
              a minute, then check spam or promotions if nothing lands.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-[10px] font-bold text-secondary">
              2
            </span>
            <span>
              <strong className="font-semibold">Click the verification link.</strong>{' '}
              You&apos;ll come back to Miraa to sign in.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-[10px] font-bold text-secondary">
              3
            </span>
            <span>
              <strong className="font-semibold">Sign in for the first time</strong>{' '}
              and we&apos;ll walk you through a quick three-minute setup.
            </span>
          </li>
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="group inline-flex items-center gap-1.5 font-semibold text-secondary transition-colors hover:text-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-secondary border-t-transparent" />
                Requesting…
              </>
            ) : resentAt ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Request received
              </>
            ) : (
              <>Request another email</>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-secondary/18 bg-secondary/6 p-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
          Seen this address before?
        </p>
        <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-on-surface-variant">
          Supabase can mask existing accounts during signup, so a fresh
          verification email may never arrive for an address that&apos;s already
          confirmed. In that case, go straight to sign in or reset your password.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px]">
          <Link
            href={loginHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-on-surface px-5 py-2.5 font-semibold text-surface transition-colors hover:bg-on-surface/90"
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href={forgotPasswordHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-2.5 font-semibold text-on-surface transition-colors hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary"
          >
            Reset password
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
        <Link
          href={loginHref}
          className="font-semibold text-secondary transition-colors hover:text-secondary/80"
        >
          Back to sign in
        </Link>
      </div>

      {resendError && (
        <p className="mt-3 text-[12.5px] text-error">{resendError}</p>
      )}

      <p className="mt-6 text-[12px] text-outline">
        Wrong email?{' '}
        <Link href="/signup" className="text-secondary hover:underline">
          Start again
        </Link>
        .
      </p>
    </div>
  );
}

/**
 * Reads a non-httpOnly cookie. The /r/<slug> route sets `miraa_ref` so we
 * can recover the referral after OAuth redirects.
 */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const target = name + '=';
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }
  return null;
}
