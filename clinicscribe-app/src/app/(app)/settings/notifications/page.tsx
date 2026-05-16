'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, MessageCircle, Moon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

/**
 * Notification preferences — surfaced as a real settings page, persisted to
 * localStorage for now (clinician-level prefs without a server round-trip).
 *
 * When we ship server-side prefs, swap the storage layer for a
 * /api/preferences round-trip and drop the localStorage reads.
 */

type Channel = 'email' | 'in_app';
type EventKey = 'critical_flag' | 'note_approved' | 'team_invite' | 'system';

interface Prefs {
  channels: Record<Channel, boolean>;
  events: Record<EventKey, { email: boolean; in_app: boolean }>;
  quiet_start: string;
  quiet_end: string;
}

const DEFAULT_PREFS: Prefs = {
  channels: { email: true, in_app: true },
  events: {
    critical_flag: { email: true,  in_app: true },
    note_approved: { email: false, in_app: true },
    team_invite:   { email: true,  in_app: true },
    system:        { email: false, in_app: true },
  },
  quiet_start: '18:00',
  quiet_end:   '07:00',
};

const STORAGE_KEY = 'miraa.notification_prefs.v1';

const EVENTS: Array<{ key: EventKey; title: string; description: string }> = [
  { key: 'critical_flag', title: 'Critical AI safety flag',  description: 'A flagged finding needs your review before sign-off.' },
  { key: 'note_approved', title: 'Note approved',            description: 'Your sign-off or a teammate&apos;s reached EMR push.' },
  { key: 'team_invite',   title: 'Team invitation accepted', description: 'Someone joined your clinic.' },
  { key: 'system',        title: 'System updates',           description: 'Maintenance, sync outages, AI policy changes.' },
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
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

  function setChannel(channel: Channel, on: boolean) {
    setPrefs((p) => ({ ...p, channels: { ...p.channels, [channel]: on } }));
  }
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
      <SectionCard
        icon={Bell}
        title="Channels"
        description="Master switches that override every per-event setting below."
      >
        <div className="space-y-3">
          <Row
            icon={MessageCircle}
            label="In-app notifications"
            sub="The bell in the header + the slide-out panel."
            value={prefs.channels.in_app}
            onChange={(v) => setChannel('in_app', v)}
          />
          <Row
            icon={Mail}
            label="Email"
            sub="Sent to the address you used to sign in."
            value={prefs.channels.email}
            onChange={(v) => setChannel('email', v)}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={Bell}
        title="Events"
        description="What triggers a notification, on which channel."
      >
        <div className="overflow-hidden rounded-xl border border-outline-variant/40">
          <div className="grid grid-cols-[1fr_90px_90px] gap-3 bg-surface px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            <span>Event</span>
            <span className="text-center">In-app</span>
            <span className="text-center">Email</span>
          </div>
          {EVENTS.map((ev, idx) => (
            <div
              key={ev.key}
              className={
                'grid grid-cols-[1fr_90px_90px] items-center gap-3 px-4 py-3 text-[13px]' +
                (idx < EVENTS.length - 1 ? ' border-b border-outline-variant/40' : '')
              }
            >
              <div>
                <p className="font-semibold">{ev.title}</p>
                <p className="mt-0.5 text-[12px] text-on-surface-variant">{ev.description}</p>
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={prefs.events[ev.key].in_app && prefs.channels.in_app}
                  disabled={!prefs.channels.in_app}
                  onChange={(v) => setEvent(ev.key, 'in_app', v)}
                />
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={prefs.events[ev.key].email && prefs.channels.email}
                  disabled={!prefs.channels.email}
                  onChange={(v) => setEvent(ev.key, 'email', v)}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        icon={Moon}
        title="Quiet hours"
        description="During this window we batch all non-critical notifications until you're back."
      >
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold text-on-surface-variant">From</span>
            <input
              type="time"
              value={prefs.quiet_start}
              onChange={(e) => setQuiet('quiet_start', e.target.value)}
              className="h-9 rounded-lg border border-outline-variant/40 bg-surface px-3 text-[13px] outline-none focus:border-secondary"
            />
          </label>
          <label className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold text-on-surface-variant">To</span>
            <input
              type="time"
              value={prefs.quiet_end}
              onChange={(e) => setQuiet('quiet_end', e.target.value)}
              className="h-9 rounded-lg border border-outline-variant/40 bg-surface px-3 text-[13px] outline-none focus:border-secondary"
            />
          </label>
          <span className="text-[12px] text-on-surface-variant">
            Critical safety flags always come through — quiet hours never suppress them.
          </span>
        </div>
      </SectionCard>

      <p className="text-[11px] text-outline">
        Preferences are stored on this device for now. Cross-device sync ships with the next
        backend rollout.
      </p>
    </div>
  );
}

/* ─── Pieces ────────────────────────────────────────────────────────────── */

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-outline-variant/40 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[15px] font-bold">{title}</p>
          <p className="text-[12px] text-on-surface-variant">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  sub,
  value,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-on-surface-variant">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-semibold">{label}</p>
        <p className="text-[12px] text-on-surface-variant">{sub}</p>
      </div>
      <Toggle checked={value} onChange={onChange} />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={
        'relative h-5 w-9 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ' +
        (checked ? 'bg-secondary' : 'bg-surface-container-high')
      }
    >
      <span
        className={
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ' +
          (checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5')
        }
      />
    </button>
  );
}
