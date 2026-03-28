'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
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
  const [form, setForm] = useState({
    first_name: '', last_name: '', specialty: '', provider_number: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        specialty: profile.specialty || '',
        provider_number: profile.provider_number || '',
      });
    }
  }, [profile]);

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
      addToast('Profile updated', 'success');
    }
    setSaving(false);
  }

  return (
    <div>
      <BreadcrumbNav items={[{ label: 'Settings', href: '/settings' }, { label: 'Profile' }]} />
      <PageHeader title="Profile Settings" description="Update your personal details." className="mt-4" />
      <Card className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="first_name" label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input id="last_name" label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <Input id="specialty" label="Specialty" placeholder="e.g. General Practice" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          <Input id="provider_number" label="Provider Number" placeholder="e.g. 1234567A" value={form.provider_number} onChange={(e) => setForm({ ...form, provider_number: e.target.value })} />
          <div className="pt-2">
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
