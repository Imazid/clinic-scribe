'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { SettingsSection, SettingsRow } from '@/components/settings/SettingsRow';
import { useUIStore } from '@/lib/stores/ui-store';
import {
  Archive,
  Database,
  Download,
  FileText,
  MapPin,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export default function SettingsDataPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [allowTraining, setAllowTraining] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      <SettingsSection eyebrow="Where your data lives" title="Data residency">
        <SettingsRow
          icon={MapPin}
          label="Australia (ap-southeast-2)"
          description="Patient records, audio, and transcripts are stored in Sydney. We do not replicate clinical data outside Australia."
        />
        <SettingsRow
          icon={ShieldCheck}
          label="Privacy Act 1988 (Cth) aligned"
          description="Access controls and audit logs comply with the Australian Privacy Principles."
          last
        />
      </SettingsSection>

      <SettingsSection eyebrow="Model improvement" title="De-identified samples">
        <SettingsRow
          icon={Database}
          label="Allow Miraa to use de-identified samples"
          description="Off by default. Only de-identified transcript snippets are ever considered. Identifiers are stripped before any sample leaves your clinic."
          control={<Toggle checked={allowTraining} onChange={setAllowTraining} />}
          last
        />
      </SettingsSection>

      <SettingsSection eyebrow="Your data" title="Export & archive">
        <SettingsRow
          icon={Download}
          label="Export all consultations"
          description="Bundle every note, prescription, and transcript into a downloadable archive."
          control={
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToast('Export queued — you’ll get an email when it’s ready.', 'info')}
            >
              Request export
            </Button>
          }
        />
        <SettingsRow
          icon={Archive}
          label="Archive inactive patients"
          description="Move patients with no activity in 24 months to an archive view."
          control={
            <Button size="sm" variant="outline" onClick={() => addToast('Archive scan starting…', 'info')}>
              Run archive scan
            </Button>
          }
        />
        <SettingsRow
          icon={FileText}
          label="Legal & privacy documents"
          description="Terms of service, privacy policy, AI safety brief."
          control={
            <Link
              href="/settings/legal"
              className="text-[12px] font-semibold text-secondary hover:underline"
            >
              Open ↗
            </Link>
          }
          last
        />
      </SettingsSection>

      {/* Danger zone */}
      <SettingsSection
        eyebrow="Danger zone"
        title="Permanent actions"
        description="These actions can’t be undone. Be sure before clicking through."
        className="border-error/30"
      >
        <SettingsRow
          danger
          icon={Trash2}
          label="Delete account permanently"
          description="Removes your profile, sign-in, and any notes you authored. Clinic-owned records remain with the clinic."
          control={
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  addToast('Click again within 5s to confirm permanent deletion.', 'warning');
                  setTimeout(() => setConfirmDelete(false), 5000);
                  return;
                }
                addToast('Deletion requests are processed manually for now. We’ve emailed support.', 'info');
                setConfirmDelete(false);
              }}
            >
              {confirmDelete ? 'Confirm delete' : 'Delete account'}
            </Button>
          }
          last
        />
      </SettingsSection>
    </div>
  );
}
