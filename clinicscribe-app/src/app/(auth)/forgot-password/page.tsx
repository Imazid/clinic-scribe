'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordInner />
    </Suspense>
  );
}

function ForgotPasswordInner() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Check your email</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          We&apos;ve sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/login" className="text-secondary font-semibold hover:underline text-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>

      <h2 className="text-2xl font-bold text-on-surface mb-1">Reset your password</h2>
      <p className="text-sm text-on-surface-variant mb-8">Enter your email and we&apos;ll send you a reset link</p>

      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="email" label="Email" type="email" placeholder="you@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>Send Reset Link</Button>
      </form>
    </div>
  );
}
