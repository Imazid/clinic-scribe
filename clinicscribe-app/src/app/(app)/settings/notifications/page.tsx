'use client';

import { useEffect, useState } from 'react';
import { Toggle } from '@/components/ui/Toggle';
import { SettingsSection } from '@/components/settings/SettingsRow';
import { Lock, Moon } from 'lucide-react';

type Channel = 'in_app' | 'email' | 'push';
type EventKey =
  | 'critical_flag'
  | 'note_pending'
  | 'note_approved'
  | 'team_invite'
  | 'patient_message'
  | 'system';

interface Prefs {
  events: Record<EventKey, Record<Channel, boolean>>;
  quiet_start: string;
  quiet_end: string;
}

const DEFAULTS: Prefs = {
  events: {
    critical_flag:  { in_app: true,  email: true,  push: true },
    note_pending:   { in_app: true,  email: false, push: false },
    note_approved:  { in_app: true,  email: false, push: false },
    team_invite:    { in_app: true,  email: true,  push: false },
    patient_message:{ in_app: true,  email: true,  push: true },
    system:         { in_app: true,  email: false, push: false },
  },
  quiet_start: '18:00',
  quiet_end: '07:00',
};

const STORAGE_KEY = 'miraa.notification_prefs.v2';

const EVENTS: Array<{
  key: EventKey;
  title: string;
  description: string;
  locked?: boolean;
}> = [
  {
    key: 'critical_flag',
    title: 'Critical AI safety flag',
    description: 'A flagged finding needs your review before sign-off. Always on.',
    locked: true,
  },
  {
    key: 'note_pending',
    title: 'Note awaiting review',
    description: 'A draft consultation note is ready for you to verify.',
  },
  {
    key: 'note_approved',
    title: 'Note approved',
    description: 'Your sign-off or a teammate’s reached EMR push.',
  },
  {
    key: 'team_invite',
    title: 'Team invitation accepted',
    description: 'Someone joined your clinic.',
  },
  {
    key: 'patient_message',
    title: 'Patient message',
    description: 'A reply on a patient summary or follow-up.',
  },
  {
    key: 'system',
    title: 'System updates',
    description: 'Maintenance, sync outages, AI policy changes.',
  },
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Prefs>;
        setPrefs({ ...DEFAULTS, ...parsed, events: { ...DEFAULTS.events, ...(parsed.events ?? {}) } });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs, hydrated]);

  function setEvent(event: EventKey, channel: Channel, on: boolean) {
    setPrefs((p) => ({
      ...p,
      events: { ...p.events, [event]: { ...p.events[event], [channel]: on } },
    }));
  }
  function setQuiet(field: 'quiet_start' | 'quiet_end', value: string) {
    setPrefs((p) => ({ ...p, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        eyebrow="Events"
        title="Notification matrix"
        description="Pick which channel each event uses. Critical safety flags are always on."
      >
        <div className="px-6 py-5">
          <div className="overflow-hidden rounded-xl border border-outline-variant/60">
            <div className="grid grid-cols-[1.6fr_80px_80px_80px] gap-3 bg-surface-container-low px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              <span>Event</span>
              <span className="text-center">In-app</span>
              <span className="text-center">Email</span>
              <span className="text-center">Push</span>
            </div>
            {EVENTS.map((ev, i) => (
              <div
                key={ev.key}
                className={
                  'grid grid-cols-[1.6fr_80px_80px_80px] items-center gap-3 px-4 py-3.5 text-[13px] ' +
                  (i < EVENTS.length - 1 ? 'border-b border-outline-variant/40' : '')
                }
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-on-surface">{ev.title}</span>
                    {ev.locked && <Lock className="h-3 w-3 text-outline" />}
                  </div>
                  <p className="mt-0.5 text-[12px] text-on-surface-variant">{ev.description}</p>
                </div>
                {(['in_app', 'email', 'push'] as Channel[]).map((ch) => (
                  <div key={ch} className="flex justify-center">
                    <Toggle
                      checked={ev.locked ? true : prefs.events[ev.key][ch]}
                      disabled={ev.locked}
                      onChange={(v) => setEvent(ev.key, ch, v)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Do not disturb"
        title="Quiet hours"
        description="During this window we batch non-critical notifications. Safety flags always come through."
      >
        <div className="flex flex-wrap items-center gap-4 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Moon className="h-4 w-4" />
          </div>
          <label className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold text-on-surface-variant">From</span>
            <input
              type="time"
              value={prefs.quiet_start}
              onChange={(e) => setQuiet('quiet_start', e.target.value)}
              className="h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-[13px] outline-none focus:border-secondary"
            />
          </label>
          <label className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold text-on-surface-variant">To</span>
            <input
              type="time"
              value={prefs.quiet_end}
              onChange={(e) => setQuiet('quiet_end', e.target.value)}
              className="h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-[13px] outline-none focus:border-secondary"
            />
          </label>
        </div>
      </SettingsSection>

      <p className="text-[11px] text-outline">
        Preferences stored on this device for now. Cross-device sync ships with the next backend rollout.
      </p>
    </div>
  );
}
