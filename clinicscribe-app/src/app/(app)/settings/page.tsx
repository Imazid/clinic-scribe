'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Building, CircleUserRound, CreditCard, Mail, Shield } from 'lucide-react';

function formatRole(role?: string | null) {
  if (!role) return 'Not set';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatSubscriptionTier(tier?: string | null) {
  if (!tier) return 'Not set';
  return tier
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function SettingsPage() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const clinic = useAuthStore((state) => state.clinic);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadUserEmail() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email || '');
    }

    loadUserEmail();
  }, []);

  const initials = useMemo(() => {
    const first = profile?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'MI';
  }, [profile?.first_name, profile?.last_name]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Personal"
        title="Account"
        description="Manage your account, clinic identity, and billing context from one workspace."
      />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant/40 px-6 py-5">
          <p className="text-base font-semibold text-on-surface">About you</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Personal and clinic context used across templates, notes, and closeout.
          </p>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-col gap-4 rounded-[1.5rem] bg-surface-container-low px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-secondary/12 text-lg font-semibold text-secondary">
                {initials}
              </div>
              <div>
                <p className="text-base font-semibold text-on-surface">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'Miraa user'}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {profile?.specialty || 'Specialty not set'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="action"
              onClick={() => router.push('/settings/profile')}
              className="w-full sm:w-auto"
            >
              Edit profile
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First name" value={profile?.first_name || ''} readOnly />
            <Input label="Last name" value={profile?.last_name || ''} readOnly />
            <Input label="Specialty" value={profile?.specialty || ''} readOnly />
            <Input label="Provider number" value={profile?.provider_number || ''} readOnly />
            <Input label="Role" value={formatRole(profile?.role)} readOnly />
            <Input label="Clinic" value={clinic?.name || ''} readOnly />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-outline-variant/40 px-6 py-5">
            <p className="text-base font-semibold text-on-surface">Login details</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Your sign-in and account context for Miraa.
            </p>
          </div>

          <div className="space-y-4 px-6 py-6">
            <Input label="Email" value={email} readOnly />
            <Input label="User role" value={formatRole(profile?.role)} readOnly />
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="action" onClick={() => router.push('/settings/profile')}>
                <CircleUserRound className="h-4 w-4" />
                Update profile
              </Button>
              <Button
                variant="outline"
                size="action"
                onClick={() => router.push('/settings/billing')}
              >
                <CreditCard className="h-4 w-4" />
                Open billing
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-outline-variant/40 px-6 py-5">
              <CardTitle className="text-base">Clinic snapshot</CardTitle>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {clinic?.name || 'Clinic not loaded'}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {clinic?.address || 'Clinic address not set'}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Phone"
                  value={clinic?.phone || ''}
                  readOnly
                />
                <Input
                  label="Subscription"
                  value={formatSubscriptionTier(clinic?.subscription_tier)}
                  readOnly
                />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-outline-variant/40 px-6 py-5">
              <CardTitle className="text-base">Security status</CardTitle>
            </div>
            <div className="space-y-3 px-6 py-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Authentication</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Multi-factor authentication and additional session controls can be added in a later pass.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Primary email</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {email || 'No email available from the current session.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
