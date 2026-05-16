'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  CheckCheck,
  CheckCircle2,
  Gift,
  Mail,
  Plug,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';

/**
 * Slide-out notification inbox. Triggered from the header bell. Pixel-
 * faithful to the design's `NotificationsPanel`. Talks to /api/notifications
 * (GET list, POST mark-read).
 *
 * Two render modes:
 *   - Hidden  → null
 *   - Visible → fixed backdrop + 440px panel pinned to the right edge
 *
 * Opens/closes via window events so the header bell stays decoupled:
 *   window.dispatchEvent(new Event('miraa:notifications:open'))
 *   window.dispatchEvent(new Event('miraa:notifications:close'))
 *
 * The header listens for `miraa:notifications:count` and updates the
 * unread pill on the bell.
 */
export type NotificationKind = 'critical' | 'success' | 'info' | 'system';

interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
  cta_label: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

type TabId = 'all' | 'mentions' | 'critical' | 'system';

export function NotificationsPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('all');
  const [items, setItems] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastFetched = useRef(0);

  // Fetch on first open + on demand. We don't poll — the panel is short
  // enough that a refresh on open is sufficient signal.
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) {
        setError('Could not load notifications');
        return;
      }
      const data = await res.json();
      const list = (data.notifications ?? []) as Notification[];
      setItems(list);
      setError(null);
      lastFetched.current = Date.now();
      // Broadcast the unread count to the bell.
      window.dispatchEvent(
        new CustomEvent('miraa:notifications:count', {
          detail: list.filter((n) => !n.is_read).length,
        })
      );
    } catch {
      setError('Network error');
    }
  }, []);

  // First load on mount so the header bell badge appears immediately.
  useEffect(() => {
    load();
  }, [load]);

  // Open/close window events for the header bell.
  useEffect(() => {
    function onOpen() {
      setOpen(true);
      // Refresh if it's been more than 30 seconds since the last fetch.
      if (Date.now() - lastFetched.current > 30_000) load();
    }
    function onClose() {
      setOpen(false);
    }
    window.addEventListener('miraa:notifications:open', onOpen);
    window.addEventListener('miraa:notifications:close', onClose);
    return () => {
      window.removeEventListener('miraa:notifications:open', onOpen);
      window.removeEventListener('miraa:notifications:close', onClose);
    };
  }, [load]);

  // Esc closes when open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const counts = useMemo(() => {
    const list = items ?? [];
    return {
      all: list.length,
      unread: list.filter((n) => !n.is_read).length,
      critical: list.filter((n) => n.kind === 'critical' && !n.is_read).length,
      system: list.filter((n) => n.kind === 'system').length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const list = items ?? [];
    switch (tab) {
      case 'critical':
        return list.filter((n) => n.kind === 'critical');
      case 'system':
        return list.filter((n) => n.kind === 'system');
      case 'mentions':
        return list.filter((n) => n.kind === 'critical' || n.kind === 'success');
      default:
        return list;
    }
  }, [items, tab]);

  async function markAllRead() {
    // Optimistic update.
    setItems((prev) => (prev ?? []).map((n) => ({ ...n, is_read: true })));
    window.dispatchEvent(new CustomEvent('miraa:notifications:count', { detail: 0 }));
    await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
  }

  async function markOne(id: string) {
    setItems((prev) => (prev ?? []).map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    const newCount = (items ?? []).filter((n) => n.id !== id && !n.is_read).length;
    window.dispatchEvent(new CustomEvent('miraa:notifications:count', { detail: newCount }));
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  function activate(n: Notification) {
    if (!n.is_read) void markOne(n.id);
    if (n.link && n.link.startsWith('/')) {
      setOpen(false);
      router.push(n.link);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      className="fixed inset-0 z-[80] flex justify-end bg-on-surface/35 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[440px] flex-col border-l border-outline-variant/30 bg-surface-container-lowest shadow-[-20px_0_60px_rgba(0,23,54,0.20)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4">
          <div>
            <p className="text-[17px] font-bold tracking-tight">Notifications</p>
            <p className="mt-0.5 text-[12px] text-on-surface-variant">
              {counts.unread === 0
                ? 'All caught up.'
                : `${counts.unread} unread${counts.critical > 0 ? ` · ${counts.critical} critical` : ''}`}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={markAllRead}
              disabled={counts.unread === 0}
              aria-label="Mark all read"
              title="Mark all read"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push('/settings');
              }}
              aria-label="Notification settings"
              title="Settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-5 pt-3">
          {(
            [
              { id: 'all',      label: `All · ${counts.all}` },
              { id: 'mentions', label: 'Mentions' },
              { id: 'critical', label: counts.critical ? `Critical · ${counts.critical}` : 'Critical' },
              { id: 'system',   label: 'System' },
            ] as Array<{ id: TabId; label: string }>
          ).map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={
                  'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ' +
                  (active
                    ? 'bg-on-surface text-surface'
                    : 'border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container')
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {error && (
            <div className="m-5 rounded-xl border border-error/30 bg-error/8 p-3 text-[12px] text-error">
              {error}
            </div>
          )}

          {!items && !error && (
            <div className="px-5 py-12 text-center text-[13px] text-on-surface-variant">Loading…</div>
          )}

          {items && filtered.length === 0 && !error && (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-[13px] font-semibold">Inbox zero.</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">
                {tab === 'all'
                  ? 'No notifications yet. Critical flags, sync events, and rewards will land here.'
                  : 'Nothing in this category right now.'}
              </p>
            </div>
          )}

          {filtered.map((n) => (
            <NotificationRow key={n.id} notification={n} onActivate={activate} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant/40 bg-surface px-4 py-3 text-[12px] text-on-surface-variant">
          <span>Quiet hours: 18:00–07:00</span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push('/settings');
            }}
            className="font-semibold text-secondary hover:underline"
          >
            Customise →
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ─── Row ───────────────────────────────────────────────────────────────── */

const ICON_BY_KIND: Record<NotificationKind, LucideIcon> = {
  critical: AlertTriangle,
  success: CheckCircle2,
  info: Mail,
  system: Settings,
};

const FALLBACK_ICONS: Record<string, LucideIcon> = {
  gift: Gift,
  plug: Plug,
  shield: ShieldCheck,
  mail: Mail,
};

function NotificationRow({
  notification,
  onActivate,
}: {
  notification: Notification;
  onActivate: (n: Notification) => void;
}) {
  const Icon = ICON_BY_KIND[notification.kind] ?? Mail;
  const iconTone = TONE_BY_KIND[notification.kind];

  return (
    <button
      type="button"
      onClick={() => onActivate(notification)}
      className={
        'relative flex w-full gap-3 border-b border-outline-variant/40 px-5 py-3.5 text-left transition-colors hover:bg-surface-container/40 ' +
        (notification.is_read ? '' : 'bg-secondary/[0.03]')
      }
    >
      {!notification.is_read && (
        <span className="absolute left-2 top-5 h-1.5 w-1.5 rounded-full bg-secondary" />
      )}
      <span
        className={
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ' + iconTone.bg + ' ' + iconTone.text
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-bold">{notification.title}</span>
          <span className="shrink-0 text-[11px] text-on-surface-variant">
            {formatRelative(notification.created_at)}
          </span>
        </span>
        {notification.body && (
          <span className="mt-0.5 block text-[12px] leading-relaxed text-on-surface-variant">
            {notification.body}
          </span>
        )}
        {notification.cta_label && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 bg-surface px-2.5 py-1 text-[11px] font-semibold">
            {notification.cta_label}
            <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </span>
    </button>
  );
}

const TONE_BY_KIND: Record<NotificationKind, { bg: string; text: string }> = {
  critical: { bg: 'bg-error/10',     text: 'text-error' },
  success:  { bg: 'bg-success/10',   text: 'text-success' },
  info:     { bg: 'bg-secondary/10', text: 'text-secondary' },
  system:   { bg: 'bg-surface-container', text: 'text-on-surface-variant' },
};

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

// Re-export FALLBACK_ICONS so it isn't tree-shaken (silences the unused
// warning if we later let writers nominate a `kind` separate from `icon`).
export { FALLBACK_ICONS };
