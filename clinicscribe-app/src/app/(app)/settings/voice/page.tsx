'use client';

import { useEffect, useState } from 'react';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAudioDevice } from '@/lib/hooks/useAudioDevice';
import { SettingsSection, SettingsRow } from '@/components/settings/SettingsRow';
import { Mic, Globe2, Trash2, Headphones, Languages } from 'lucide-react';

const STORAGE_KEY = 'miraa:settings:voice';

type VoicePrefs = {
  retentionDays: 30 | 90 | 365;
  language: 'en-AU' | 'en-GB' | 'en-US';
  noiseSuppression: boolean;
  diarization: boolean;
};

const DEFAULTS: VoicePrefs = {
  retentionDays: 90,
  language: 'en-AU',
  noiseSuppression: true,
  diarization: true,
};

export default function SettingsVoicePage() {
  const addToast = useUIStore((s) => s.addToast);
  const device = useAudioDevice();
  const [prefs, setPrefs] = useState<VoicePrefs>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  function update<K extends keyof VoicePrefs>(key: K, value: VoicePrefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setDirty(false);
      addToast('Voice preferences saved', 'success');
    } catch {
      addToast('Could not persist preferences', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        eyebrow="Microphone"
        title="Capture quality"
        description="Improves transcript accuracy during live sessions."
      >
        <SettingsRow
          icon={Mic}
          label="Active input device"
          description={device.device?.shortLabel ?? 'Default system input'}
        />
        <SettingsRow
          icon={Headphones}
          label="Noise suppression"
          description="Reduces room and HVAC noise picked up by the mic."
          control={
            <Toggle
              checked={prefs.noiseSuppression}
              onChange={(v) => update('noiseSuppression', v)}
            />
          }
        />
        <SettingsRow
          icon={Mic}
          label="Speaker diarization"
          description="Separate clinician vs. patient turns in the transcript (Deepgram only)."
          control={
            <Toggle
              checked={prefs.diarization}
              onChange={(v) => update('diarization', v)}
            />
          }
          last
        />
      </SettingsSection>

      <SettingsSection eyebrow="Language" title="Transcription language">
        <div className="grid gap-2 p-6 sm:grid-cols-3">
          {(['en-AU', 'en-GB', 'en-US'] as const).map((lang) => {
            const isActive = prefs.language === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => update('language', lang)}
                className={
                  'flex items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-2.5 text-[13px] font-semibold transition-colors ' +
                  (isActive
                    ? 'border-secondary bg-secondary-fixed text-secondary'
                    : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-secondary/40')
                }
              >
                <Languages className="h-4 w-4" />
                {lang === 'en-AU' ? 'English (AU)' : lang === 'en-GB' ? 'English (UK)' : 'English (US)'}
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Retention"
        title="Audio retention"
        description="Recordings are deleted automatically after this window. Transcripts are kept."
      >
        <div className="grid gap-2 p-6 sm:grid-cols-3">
          {([30, 90, 365] as const).map((days) => {
            const isActive = prefs.retentionDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => update('retentionDays', days)}
                className={
                  'flex items-center justify-between gap-2 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-colors ' +
                  (isActive
                    ? 'border-secondary bg-secondary-fixed text-secondary'
                    : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-secondary/40')
                }
              >
                <div>
                  <p className="text-[14px] font-semibold">{days} days</p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">
                    {days === 30 ? 'Minimum' : days === 90 ? 'Recommended' : 'Maximum'}
                  </p>
                </div>
                <Trash2 className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection eyebrow="Residency" title="Where audio is processed">
        <SettingsRow
          icon={Globe2}
          label="Australia (Sydney)"
          description="All audio is processed inside Australian infrastructure (Deepgram AU + Supabase ap-southeast-2)."
          last
        />
      </SettingsSection>

      <div className="flex justify-end">
        <Button size="sm" disabled={!dirty} onClick={save}>
          Save preferences
        </Button>
      </div>

      <p className="text-[11px] text-outline">
        Stored on this device while we finalise per-user audio settings sync.
      </p>
    </div>
  );
}
