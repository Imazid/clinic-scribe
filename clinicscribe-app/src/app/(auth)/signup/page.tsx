'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupInput } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Stethoscope } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupInput>({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', clinicName: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError('');

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
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          clinic_name: form.clinicName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login?message=Check your email to confirm your account');
  }

  function update(field: keyof SignupInput, value: string) {
    setForm({ ...form, [field]: value });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-on-secondary" />
        </div>
        <span className="text-xl font-bold text-primary">Miraa</span>
      </div>

      <h2 className="text-2xl font-bold text-on-surface mb-1">Create your account</h2>
      <p className="text-sm text-on-surface-variant mb-8">Start your free trial today</p>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input id="firstName" label="First Name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} error={errors.firstName} />
          <Input id="lastName" label="Last Name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} error={errors.lastName} />
        </div>
        <Input id="clinicName" label="Clinic Name" value={form.clinicName} onChange={(e) => update('clinicName', e.target.value)} error={errors.clinicName} />
        <Input id="email" label="Email" type="email" placeholder="you@clinic.com" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
        <Input id="password" label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => update('password', e.target.value)} error={errors.password} />
        <Input id="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} error={errors.confirmPassword} />

        <p className="text-xs leading-5 text-on-surface-variant">
          By creating an account, you agree to the{' '}
          <Link href="/terms" className="text-secondary hover:underline">
            Terms of Service
          </Link>{' '}
          and acknowledge the{' '}
          <Link href="/privacy" className="text-secondary hover:underline">
            Privacy Policy
          </Link>.
        </p>

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-sm text-center text-on-surface-variant mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-secondary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
