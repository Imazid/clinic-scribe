'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SettingsSection, SettingsRow } from '@/components/settings/SettingsRow';
import { Building2, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function SettingsClinicPage() {
  const clinic = useAuthStore((s) => s.clinic);
  const setClinic = useAuthStore((s) => s.setClinic);
  const addToast = useUIStore((s) => s.addToast);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!clinic) return;
    setName(clinic.name ?? '');
    setAddress(clinic.address ?? '');
    setPhone(clinic.phone ?? '');
    setEmail(clinic.email ?? '');
  }, [clinic]);

  async function handleSave() {
    if (!clinic) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clinics')
        .update({ name, address, phone, email })
        .eq('id', clinic.id)
        .select('*')
        .single();
      if (error) throw error;
      setClinic(data);
      setDirty(false);
      addToast('Clinic updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save clinic', 'error');
    } finally {
      setSaving(false);
    }
  }

  function track<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setDirty(true);
    };
  }

  return (
    <div className="space-y-6">
      <SettingsSection eyebrow="Practice" title="Clinic details">
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <Input
            label="Clinic name"
            value={name}
            onChange={(e) => track(setName)(e.target.value)}
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => track(setPhone)(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => track(setEmail)(e.target.value)}
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => track(setAddress)(e.target.value)}
          />
        </div>
        <div className="flex justify-end border-t border-outline-variant/60 bg-surface-container-low px-6 py-3">
          <Button size="sm" isLoading={saving} disabled={!dirty || saving} onClick={handleSave}>
            Save changes
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="At a glance"
        title="Practice snapshot"
        description="Read-only summary that appears on letterheads, referrals, and patient communications."
      >
        <SettingsRow
          icon={Building2}
          label="Practice name"
          description={clinic?.name ?? '—'}
        />
        <SettingsRow icon={MapPin} label="Address" description={clinic?.address || '—'} />
        <SettingsRow icon={Phone} label="Phone" description={clinic?.phone || '—'} />
        <SettingsRow icon={Mail} label="Email" description={clinic?.email || '—'} />
        <SettingsRow
          icon={Clock}
          label="Operating hours"
          description="Mon–Fri 8:30am–5:00pm · weekend on-call rotation"
          last
        />
      </SettingsSection>

      <p className="text-[11px] text-outline">
        Locations and hours management ships next. Current snapshot is shown read-only.
      </p>
    </div>
  );
}
