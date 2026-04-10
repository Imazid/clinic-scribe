'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Stethoscope } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    router.push(returnTo);
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
    <div>
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-on-secondary" />
        </div>
        <span className="text-xl font-bold text-primary">Miraa</span>
      </div>

      <h2 className="text-2xl font-bold text-on-surface mb-1">Welcome back</h2>
      <p className="text-sm text-on-surface-variant mb-8">Sign in to your account to continue</p>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@clinic.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-secondary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-outline-variant/50" />
        <span className="text-xs text-outline uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-outline-variant/50" />
      </div>

      <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleLogin}>
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </Button>

      <p className="text-sm text-center text-on-surface-variant mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-secondary font-semibold hover:underline">
          Sign up
        </Link>
      </p>

      <p className="mt-4 text-center text-xs leading-5 text-on-surface-variant">
        By continuing, you agree to the{' '}
        <Link href="/terms" className="text-secondary hover:underline">
          Terms of Service
        </Link>{' '}
        and acknowledge the{' '}
        <Link href="/privacy" className="text-secondary hover:underline">
          Privacy Policy
        </Link>.
      </p>
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
