'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { Building, CircleUserRound, CreditCard, KeyRound, Mail, ShieldCheck, ListChecks, FileText, Users } from 'lucide-react';
import { useNoteReviewLayout } from '@/lib/hooks/useNoteReviewLayout';

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
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const { layout: noteReviewLayout, setLayout: setNoteReviewLayout, ready: noteReviewLayoutReady } = useNoteReviewLayout();

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const [{ data: userData }, { data: mfaData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.mfa.listFactors(),
      ]);
      setEmail(userData.user?.email || '');
      const verified = (mfaData?.totp || []).filter((f) => f.status === 'verified');
      setMfaEnabled(verified.length > 0);
    }

    loadUserData();
  }, []);

  const initials = useMemo(() => {
    const first = profile?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'MI';
  }, [profile?.first_name, profile?.last_name]);

  return (
    <div className="space-y-6">
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
              <Button
                variant="outline"
                size="action"
                onClick={() => router.push('/settings/team')}
              >
                <Users className="h-4 w-4" />
                Manage team
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Multi-factor authentication</p>
                    <div className="mt-1 flex items-center gap-2">
                      {mfaEnabled === null ? (
                        <span className="text-sm text-on-surface-variant">Loading...</span>
                      ) : mfaEnabled ? (
                        <Badge variant="success">Enabled</Badge>
                      ) : (
                        <Badge variant="default">Not enabled</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings/security')}
                >
                  Manage
                </Button>
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

      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant/40 px-6 py-5">
          <p className="flex items-center gap-2 text-base font-semibold text-on-surface">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            Workflow preferences
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            How you want to step through note review and verify queues.
          </p>
        </div>
        <div className="px-6 py-6">
          <div>
            <p className="text-sm font-semibold text-on-surface">Note review layout</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Choose how pending notes surface from the dashboard and inbox.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: 'single' as const,
                  icon: FileText,
                  title: 'Direct review (default)',
                  body: 'Clicking a pending note opens the full review page directly.',
                },
                {
                  id: 'queue' as const,
                  icon: ListChecks,
                  title: 'Verify queue index',
                  body: 'A /notes/queue index lists every pending note as a roomy verify card; clicking opens the same review.',
                },
              ].map((option) => {
                const isActive = noteReviewLayout === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setNoteReviewLayout(option.id)}
                    disabled={!noteReviewLayoutReady}
                    className={
                      'flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition-colors disabled:opacity-50 ' +
                      (isActive
                        ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20'
                        : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40')
                    }
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                        <Icon className="h-4 w-4" />
                      </div>
                      {isActive && <Badge variant="info">Active</Badge>}
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{option.title}</p>
                    <p className="text-xs leading-relaxed text-on-surface-variant">
                      {option.body}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-outline">
              Stored on this device. We&apos;ll move this to your profile when cross-device sync ships.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
