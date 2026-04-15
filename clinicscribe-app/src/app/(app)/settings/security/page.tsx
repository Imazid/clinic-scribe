'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/lib/stores/ui-store';
import { createClient } from '@/lib/supabase/client';
import { KeyRound, QrCode, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';

type MfaState = 'loading' | 'disabled' | 'enrolling' | 'verifying' | 'enabled';

interface TotpFactor {
  id: string;
  friendly_name?: string;
  status: string;
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
      addToast(
        err instanceof Error ? err.message : 'Failed to start MFA enrollment',
        'error'
      );
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
      addToast(
        err instanceof Error ? err.message : 'Verification failed — check your code',
        'error'
      );
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
      addToast(
        err instanceof Error ? err.message : 'Failed to disable MFA',
        'error'
      );
    } finally {
      setUnenrolling(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Security"
        description="Manage multi-factor authentication and session security."
      />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant/40 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Multi-Factor Authentication</CardTitle>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  Add a second layer of protection to your account.
                </p>
              </div>
            </div>
            {mfaState === 'enabled' ? (
              <Badge variant="success">Enabled</Badge>
            ) : mfaState === 'disabled' ? (
              <Badge variant="default">Not enabled</Badge>
            ) : null}
          </div>
        </div>

        <div className="px-6 py-6">
          {mfaState === 'loading' ? (
            <div className="h-20 flex items-center justify-center text-sm text-on-surface-variant">
              Loading security settings...
            </div>
          ) : mfaState === 'disabled' ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <ShieldOff className="h-12 w-12 text-on-surface-variant/40" />
              <p className="text-sm text-on-surface-variant text-center max-w-md">
                MFA is not enabled. Enable it to require a verification code from your
                authenticator app each time you sign in.
              </p>
              <Button onClick={handleEnroll}>
                <ShieldCheck className="h-4 w-4" />
                Enable MFA
              </Button>
            </div>
          ) : mfaState === 'enrolling' ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-on-surface">
                  Scan this QR code with your authenticator app
                </p>
                {qrCode ? (
                  <div className="rounded-xl border border-outline-variant/30 bg-white p-4">
                    <img
                      src={qrCode}
                      alt="MFA QR Code"
                      className="h-48 w-48"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-surface-container-low">
                    <QrCode className="h-12 w-12 text-on-surface-variant/30" />
                  </div>
                )}
                {secret ? (
                  <div className="rounded-lg bg-surface-container-low px-4 py-3 text-center">
                    <p className="text-xs text-on-surface-variant mb-1">
                      Or enter this code manually:
                    </p>
                    <p className="font-mono text-sm font-semibold text-on-surface tracking-wider select-all">
                      {secret}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-on-surface-variant">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <Input
                  className="max-w-xs text-center font-mono text-lg tracking-[0.3em]"
                  value={verifyCode}
                  onChange={(e) =>
                    setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleVerify}
                    disabled={verifyCode.length !== 6}
                    isLoading={verifying}
                  >
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
          ) : mfaState === 'enabled' ? (
            <div className="space-y-4">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnenroll(factor.id)}
                    isLoading={unenrolling}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Disable
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
