'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validators';

/* ------------------------------------------------------------------ */
/* SSO buttons                                                         */
/* ------------------------------------------------------------------ */

function AppleButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-on-surface text-sm font-semibold text-surface transition-transform hover:-translate-y-px disabled:opacity-50"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      Continue with Apple
    </button>
  );
}

function GoogleButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-semibold text-on-surface transition-colors hover:border-secondary/30 hover:bg-secondary/5 disabled:opacity-50"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

function PosterField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  suffix,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-outline">
        {label}
      </span>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 pr-10 text-sm text-on-surface outline-none transition-[border-color,box-shadow] focus:border-secondary focus:ring-2 focus:ring-secondary/20"
        />
        {suffix && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {error && <span className="text-xs font-medium text-error">{error}</span>}
    </label>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const justConfirmed = searchParams.get('confirmed') === '1';
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as keyof LoginInput] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    // First-time login gate: if the user's profile hasn't been onboarded
    // yet, route them through `/onboarding` regardless of `returnTo`. Once
    // they finish, the wizard sets `onboarding_completed_at` and future
    // logins go straight to `returnTo` (default `/dashboard`).
    let destination = returnTo;
    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (profile && profile.onboarding_completed_at == null) {
        destination = '/onboarding';
      }
    }

    router.push(destination);
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-on-surface text-on-primary">
      {/* Newsprint backdrop glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(232,219,200,0.10)_0%,transparent_60%)]"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-7 md:px-10 md:pt-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest font-display text-lg font-bold italic text-on-surface">
            m
          </div>
          <span className="text-[13px] font-semibold tracking-tight">Miraa</span>
        </Link>
        <div className="flex items-center gap-4 text-[13px] text-on-primary/70">
          <span className="hidden sm:inline">New here?</span>
          <Link
            href="/signup"
            className="rounded-full border border-on-primary/20 px-4 py-2 text-[13px] font-semibold text-on-primary transition-colors hover:border-on-primary/40"
          >
            Start free trial
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 grid min-h-[calc(100vh-72px)] grid-cols-1 gap-12 px-6 py-12 md:px-10 lg:grid-cols-[1.4fr_minmax(380px,1fr)] lg:gap-20 lg:px-20 lg:py-20">
        {/* Editorial side */}
        <div className="flex flex-col justify-center">
          <div className="mb-7 text-[11px] font-bold uppercase tracking-[0.16em] text-surface-container-highest">
            Vol. 4 · Welcome back
          </div>
          <h1
            className="m-0 font-display font-medium leading-[0.95] tracking-[-0.04em] text-on-primary"
            style={{ fontSize: 'clamp(56px, 9vw, 96px)' }}
          >
            Be in the
            <br />
            <span className="italic text-surface-container-highest">room.</span>
          </h1>
          <p className="mt-7 max-w-[460px] text-[17px] leading-relaxed text-on-primary/75">
            Your notes are waiting where you left them. Sign in and pick up the next consult.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-primary/55">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Australian-hosted
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-success" />
              End-to-end encrypted
            </span>
            <span className="hidden sm:inline">·</span>
            <span>RACGP-accredited</span>
          </div>
        </div>

        {/* Form card */}
        <div className="flex items-center">
          <div className="w-full rounded-3xl bg-surface-container-low p-8 text-on-surface shadow-[0_40px_80px_rgba(0,0,0,0.4)] md:p-9">
            {justConfirmed && !serverError && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-on-surface">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Email confirmed.</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Sign in below to set up your workspace.
                  </p>
                </div>
              </div>
            )}

            {serverError && (
              <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <PosterField
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                error={errors.email}
                placeholder="you@clinic.com"
              />
              <PosterField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                error={errors.password}
                placeholder="Enter your password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <div className="-mt-0.5 flex items-center justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-on-surface-variant">
                  <button
                    type="button"
                    onClick={() => setKeepSignedIn((v) => !v)}
                    aria-pressed={keepSignedIn}
                    className={
                      'flex h-[18px] w-[18px] items-center justify-center rounded-md transition-colors ' +
                      (keepSignedIn
                        ? 'bg-secondary text-on-secondary'
                        : 'border border-outline-variant bg-surface-container-lowest')
                    }
                  >
                    {keepSignedIn && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  Keep me signed in
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-on-surface text-[15px] font-bold text-surface transition-all hover:-translate-y-px hover:shadow-ambient disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </button>

              <div className="my-1.5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-outline">
                <div className="h-px flex-1 bg-outline-variant" />
                or
                <div className="h-px flex-1 bg-outline-variant" />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <AppleButton disabled />
                <GoogleButton onClick={handleGoogleLogin} disabled={loading} />
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-secondary hover:underline">
                Start a 14-day trial
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer legal */}
      <footer className="relative z-10 flex flex-wrap justify-center gap-x-5 gap-y-1 px-6 pb-6 text-xs text-on-primary/50">
        <Link href="/privacy" className="hover:text-on-primary">Privacy</Link>
        <Link href="/terms" className="hover:text-on-primary">Terms</Link>
        <Link href="/legal" className="hover:text-on-primary">Legal hub</Link>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
