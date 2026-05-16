'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { createClient } from '@/lib/supabase/client';
import { profileSchema } from '@/lib/validators';

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const addToast = useUIStore((s) => s.addToast);
  const [draft, setDraft] = useState<Partial<{
    first_name: string;
    last_name: string;
    specialty: string;
    provider_number: string;
  }>>({});
  const [saving, setSaving] = useState(false);

  const form = useMemo(
    () => ({
      first_name: draft.first_name ?? profile?.first_name ?? '',
      last_name: draft.last_name ?? profile?.last_name ?? '',
      specialty: draft.specialty ?? profile?.specialty ?? '',
      provider_number: draft.provider_number ?? profile?.provider_number ?? '',
    }),
    [draft, profile?.first_name, profile?.last_name, profile?.provider_number, profile?.specialty]
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) { addToast(result.error.issues[0].message, 'error'); return; }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        specialty: form.specialty || null,
        provider_number: form.provider_number || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile!.id);

    if (error) { addToast('Failed to update profile', 'error'); }
    else {
      setProfile({ ...profile!, ...form, specialty: form.specialty || null, provider_number: form.provider_number || null });
      setDraft({});
      addToast('Profile updated', 'success');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant/40 px-6 py-5">
          <p className="text-base font-semibold text-on-surface">About you</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Keep your name, specialty, and provider details current so workflow outputs stay accurate.
          </p>
        </div>
        <form onSubmit={handleSave} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="first_name"
              label="First Name"
              value={form.first_name}
              onChange={(e) => setDraft((current) => ({ ...current, first_name: e.target.value }))}
            />
            <Input
              id="last_name"
              label="Last Name"
              value={form.last_name}
              onChange={(e) => setDraft((current) => ({ ...current, last_name: e.target.value }))}
            />
          </div>
          <Input
            id="specialty"
            label="Specialty"
            placeholder="e.g. General Practice"
            value={form.specialty}
            onChange={(e) => setDraft((current) => ({ ...current, specialty: e.target.value }))}
          />
          <Input
            id="provider_number"
            label="Provider Number"
            placeholder="e.g. 1234567A"
            value={form.provider_number}
            onChange={(e) => setDraft((current) => ({ ...current, provider_number: e.target.value }))}
          />
          <div className="pt-2">
            <Button type="submit" size="action" isLoading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
