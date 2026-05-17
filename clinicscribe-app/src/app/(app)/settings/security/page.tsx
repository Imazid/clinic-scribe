'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SettingsSection, SettingsRow } from '@/components/settings/SettingsRow';
import { useUIStore } from '@/lib/stores/ui-store';
import { createClient } from '@/lib/supabase/client';
import {
  Globe,
  KeyRound,
  Laptop,
  QrCode,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from 'lucide-react';

type MfaState = 'loading' | 'disabled' | 'enrolling' | 'verifying' | 'enabled';

interface TotpFactor {
  id: string;
  friendly_name?: string;
  status: string;
}

interface SessionRow {
  id: string;
  label: string;
  meta: string;
  current: boolean;
}

export default function SecurityPage() {
  const addToast = useUIStore((state) => state.addToast);
  const [mfaState, setMfaState] = useState<MfaState>('loading');
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  const loadFactors = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const verified = (data.totp || []).filter((f) => f.status === 'verified');
      setFactors(verified as TotpFactor[]);
      setMfaState(verified.length > 0 ? 'enabled' : 'disabled');
    } catch (err) {
      console.error(err);
      setMfaState('disabled');
    }
  }, []);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  useEffect(() => {
    async function loadSessions() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const browser = /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : /Firefox\//.test(ua)
              ? 'Firefox'
              : 'Browser';
        const platform = /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Device';
        const lastSignIn = data.user?.last_sign_in_at
          ? new Date(data.user.last_sign_in_at).toLocaleString('en-AU', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Just now';
        setSessions([
          {
            id: 'current',
            label: `${browser} on ${platform}`,
            meta: `This device · last activity ${lastSignIn}`,
            current: true,
          },
        ]);
      } catch {
        setSessions([]);
      }
    }
    loadSessions();
  }, []);

  async function handleEnroll() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator app',
      });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setPendingFactorId(data.id);
      setMfaState('enrolling');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to start MFA enrollment', 'error');
    }
  }

  async function handleVerify() {
    if (!pendingFactorId || verifyCode.length !== 6) return;
    setVerifying(true);
    try {
      const supabase = createClient();
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: pendingFactorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: pendingFactorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      addToast('MFA enabled successfully', 'success');
      setQrCode(null);
      setSecret(null);
      setPendingFactorId(null);
      setVerifyCode('');
      await loadFactors();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Verification failed — check your code', 'error');
    } finally {
      setVerifying(false);
    }
  }

  async function handleUnenroll(factorId: string) {
    setUnenrolling(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      addToast('MFA disabled', 'success');
      await loadFactors();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to disable MFA', 'error');
    } finally {
      setUnenrolling(false);
    }
  }

  async function handleSignOutAll() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        eyebrow="Two-factor"
        title="Multi-factor authentication"
        description="Require a one-time code from your authenticator app on sign-in."
        trailing={
          mfaState === 'enabled' ? (
            <Badge variant="success">Enabled</Badge>
          ) : mfaState === 'disabled' ? (
            <Badge variant="default">Not enabled</Badge>
          ) : null
        }
      >
        <div className="px-6 py-6">
          {mfaState === 'loading' && (
            <div className="flex h-20 items-center justify-center text-sm text-on-surface-variant">
              Loading security settings…
            </div>
          )}
          {mfaState === 'disabled' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <ShieldOff className="h-12 w-12 text-on-surface-variant/40" />
              <p className="max-w-md text-sm text-on-surface-variant">
                MFA is not enabled. Enable it to require a verification code from your authenticator
                app each time you sign in.
              </p>
              <Button onClick={handleEnroll}>
                <ShieldCheck className="h-4 w-4" />
                Enable MFA
              </Button>
            </div>
          )}
          {mfaState === 'enrolling' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-on-surface">
                  Scan this QR code with your authenticator app
                </p>
                {qrCode ? (
                  <div className="rounded-xl border border-outline-variant/40 bg-white p-4">
                    <img src={qrCode} alt="MFA QR Code" className="h-48 w-48" />
                  </div>
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-surface-container-low">
                    <QrCode className="h-12 w-12 text-on-surface-variant/30" />
                  </div>
                )}
                {secret && (
                  <div className="rounded-lg bg-surface-container-low px-4 py-3 text-center">
                    <p className="mb-1 text-xs text-on-surface-variant">
                      Or enter this code manually:
                    </p>
                    <p className="select-all font-mono text-sm font-semibold tracking-wider text-on-surface">
                      {secret}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-on-surface-variant">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <Input
                  className="max-w-xs text-center font-mono text-lg tracking-[0.3em]"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <div className="flex items-center gap-3">
                  <Button onClick={handleVerify} disabled={verifyCode.length !== 6} isLoading={verifying}>
                    Verify and enable
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMfaState('disabled');
                      setQrCode(null);
                      setSecret(null);
                      setPendingFactorId(null);
                      setVerifyCode('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          {mfaState === 'enabled' && (
            <div className="space-y-3">
              {factors.map((factor) => (
                <div
                  key={factor.id}
                  className="flex items-center justify-between rounded-xl bg-surface-container-low px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {factor.friendly_name || 'Authenticator app'}
                      </p>
                      <p className="text-xs text-on-surface-variant">TOTP · Active</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleUnenroll(factor.id)} isLoading={unenrolling}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Disable
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Devices"
        title="Active sessions"
        description="Devices signed in to your account."
        trailing={
          <Button size="sm" variant="outline" onClick={handleSignOutAll}>
            Sign out all
          </Button>
        }
      >
        {sessions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-on-surface-variant">
            No active sessions detected.
          </div>
        ) : (
          sessions.map((s, i) => (
            <SettingsRow
              key={s.id}
              icon={s.label.includes('Mac') || s.label.includes('Windows') || s.label.includes('Linux') ? Laptop : Globe}
              label={s.label}
              description={s.meta}
              control={
                s.current ? (
                  <Badge variant="info">Current</Badge>
                ) : (
                  <Button size="sm" variant="outline">Sign out</Button>
                )
              }
              last={i === sessions.length - 1}
            />
          ))
        )}
      </SettingsSection>

      <SettingsSection eyebrow="Single sign-on" title="SSO & access" description="Reserved for enterprise plans.">
        <SettingsRow
          icon={KeyRound}
          label="SAML / SCIM"
          description="Provision and authenticate users via your identity provider."
          control={<Badge variant="default">Enterprise only</Badge>}
          last
        />
      </SettingsSection>
    </div>
  );
}
