'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  MoreHorizontal,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Team management — pixel-faithful to the design's `TeamScreen`. Surfaces
 * the already-shipped `/api/team/members` + `/api/invitations` endpoints
 * so admins can:
 *   - see active clinicians + admins
 *   - see pending invitations + revoke them
 *   - invite a new clinician (admin only)
 *
 * Non-admin members get a read-only view of the roster.
 */

type Member = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  role: 'admin' | 'clinician' | 'receptionist';
  avatar_url: string | null;
  created_at: string;
};

type Invitation = {
  id: string;
  email: string;
  role: 'admin' | 'clinician' | 'receptionist';
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

type FilterTab = 'all' | 'clinicians' | 'admins' | 'pending';

export default function TeamPage() {
  const profile = useAuthStore((s) => s.profile);
  const clinic = useAuthStore((s) => s.clinic);
  const isAdmin = profile?.role === 'admin';

  const [members, setMembers] = useState<Member[] | null>(null);
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [mRes, iRes] = await Promise.all([
          fetch('/api/team/members'),
          fetch('/api/invitations'),
        ]);
        const mJson = await mRes.json();
        const iJson = iRes.ok ? await iRes.json() : { invitations: [] };
        if (cancelled) return;
        if (!mRes.ok) {
          setLoadError(mJson.error || 'Failed to load team');
          return;
        }
        setMembers(mJson.members ?? []);
        setInvitations(iJson.invitations ?? []);
      } catch {
        if (!cancelled) setLoadError('Network error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingInvites = useMemo(
    () => (invitations ?? []).filter((i) => !i.accepted_at && !i.revoked_at),
    [invitations]
  );

  async function revoke(invitationId: string) {
    if (!confirm('Revoke this invitation? The link will stop working.')) return;
    const res = await fetch(`/api/invitations/${invitationId}`, { method: 'DELETE' });
    if (res.ok) {
      setInvitations((prev) =>
        (prev ?? []).map((i) =>
          i.id === invitationId ? { ...i, revoked_at: new Date().toISOString() } : i
        )
      );
    }
  }

  const filteredMembers = useMemo(() => {
    let list = members ?? [];
    if (filter === 'clinicians') list = list.filter((m) => m.role === 'clinician');
    if (filter === 'admins') list = list.filter((m) => m.role === 'admin');
    if (filter === 'pending') return [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) =>
        `${m.first_name} ${m.last_name} ${m.specialty ?? ''}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, filter, query]);

  const visiblePending = filter === 'pending' || filter === 'all' ? pendingInvites : [];

  const memberCount = (members ?? []).length;
  const pendingCount = pendingInvites.length;

  return (
    <div className="space-y-6">
        {/* Roster summary + invite CTA */}
        <div className="flex items-end justify-between">
          <p className="text-[13px] text-on-surface-variant">
            {clinic?.name ?? 'Your clinic'} · {memberCount} member{memberCount === 1 ? '' : 's'}
            {pendingCount > 0 ? ` · ${pendingCount} pending invite${pendingCount === 1 ? '' : 's'}` : ''}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-on-surface px-4 text-[13px] font-bold text-surface hover:bg-on-surface/90"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite clinician
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Members" value={memberCount} />
          <StatCard label="Pending invites" value={pendingCount} tone={pendingCount > 0 ? 'warning' : 'default'} />
          <StatCard label="Admins" value={(members ?? []).filter((m) => m.role === 'admin').length} />
          <StatCard label="Clinicians" value={(members ?? []).filter((m) => m.role === 'clinician').length} />
        </div>

        {loadError && (
          <div className="mb-5 rounded-2xl border border-error/30 bg-error/8 p-4 text-[13px] text-error">
            {loadError}
          </div>
        )}

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient-sm">
          {/* Filter row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 px-5 py-3.5">
            <div className="flex items-center gap-2">
              {(['all', 'clinicians', 'admins', 'pending'] as FilterTab[]).map((tab) => {
                const active = filter === tab;
                const label =
                  tab === 'all'
                    ? 'All members'
                    : tab === 'clinicians'
                      ? 'Clinicians'
                      : tab === 'admins'
                        ? 'Admins'
                        : 'Pending';
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={
                      'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ' +
                      (active
                        ? 'bg-on-surface text-surface'
                        : 'border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container')
                    }
                  >
                    {label}
                    {tab === 'pending' && pendingCount > 0 && (
                      <span className="ml-1 font-mono text-[10px]">{pendingCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex h-9 w-[260px] items-center gap-2.5 rounded-xl border border-outline-variant/40 bg-surface px-3.5">
              <Search className="h-3.5 w-3.5 text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members…"
                className="flex-1 border-none bg-transparent text-[13px] outline-none"
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr_60px] gap-3.5 border-b border-outline-variant/40 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            <div>Member</div>
            <div>Specialty</div>
            <div>Joined</div>
            <div>Role</div>
            <div />
          </div>

          {/* Loading */}
          {!members && !loadError && (
            <div className="px-5 py-12 text-center text-[13px] text-on-surface-variant">
              Loading team…
            </div>
          )}

          {/* Members */}
          {filteredMembers.map((m, idx) => {
            const isYou = m.user_id === profile?.user_id;
            const last = filteredMembers.length - 1 === idx && visiblePending.length === 0;
            return (
              <div
                key={m.id}
                className={
                  'grid grid-cols-[2fr_1.2fr_1.2fr_1fr_60px] items-center gap-3.5 px-5 py-3.5 text-[13px]' +
                  (!last ? ' border-b border-outline-variant/40' : '')
                }
              >
                <div className="flex items-center gap-3">
                  <Initials first={m.first_name} last={m.last_name} role={m.role} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {m.first_name} {m.last_name}
                      </span>
                      {isYou && (
                        <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                          You
                        </span>
                      )}
                      {m.role === 'admin' && (
                        <span className="rounded-full bg-on-surface px-2 py-0.5 text-[10px] font-semibold text-surface">
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-on-surface-variant">
                      {/* Email isn't on profile — could JOIN auth.users via a view later */}
                      Member since {formatJoined(m.created_at)}
                    </div>
                  </div>
                </div>
                <div className="text-on-surface-variant">{m.specialty ?? '—'}</div>
                <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Active
                </div>
                <div className="font-semibold capitalize">{m.role}</div>
                <button
                  type="button"
                  aria-label="More actions"
                  className="flex h-8 w-8 items-center justify-center justify-self-end rounded-lg border border-outline-variant/40 bg-surface text-on-surface-variant hover:bg-surface-container"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}

          {/* Pending invites */}
          {visiblePending.map((inv, idx) => (
            <div
              key={inv.id}
              className={
                'grid grid-cols-[2fr_1.2fr_1.2fr_1fr_60px] items-center gap-3.5 px-5 py-3.5 text-[13px]' +
                (idx < visiblePending.length - 1 ? ' border-b border-outline-variant/40' : '')
              }
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-outline-variant text-on-surface-variant">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold">{inv.email}</span>
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                      Invited
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-on-surface-variant">
                    Expires {formatJoined(inv.expires_at)} · invited {formatJoined(inv.created_at)}
                  </div>
                </div>
              </div>
              <div className="text-on-surface-variant">—</div>
              <div className="text-[12px] text-warning">Pending accept</div>
              <div className="font-semibold capitalize">{inv.role}</div>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => revoke(inv.id)}
                  aria-label="Revoke invitation"
                  className="flex h-8 w-8 items-center justify-center justify-self-end rounded-lg border border-outline-variant/40 bg-surface text-error hover:bg-error/8"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div />
              )}
            </div>
          ))}

          {/* Empty state */}
          {members && filteredMembers.length === 0 && visiblePending.length === 0 && (
            <div className="px-5 py-12 text-center text-[13px] text-on-surface-variant">
              {filter === 'pending' ? 'No pending invites.' : 'No team members match this filter.'}
            </div>
          )}
        </div>

      {/* Invite modal */}
      {showInvite && isAdmin && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onCreated={(invite) => {
            setInvitations((prev) => [invite, ...(prev ?? [])]);
            setShowInvite(false);
          }}
        />
      )}
    </div>
  );
}

/* ─── Pieces ────────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'default' | 'warning';
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p
        className={
          'mt-1 font-display text-[26px] font-semibold leading-none tracking-[-0.02em] ' +
          (tone === 'warning' && value > 0 ? 'text-warning' : 'text-on-surface')
        }
      >
        {value}
      </p>
    </div>
  );
}

function Initials({
  first,
  last,
  role,
}: {
  first: string;
  last: string;
  role: 'admin' | 'clinician' | 'receptionist';
}) {
  const letters = `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  const tone =
    role === 'admin'
      ? 'bg-on-surface text-surface'
      : 'bg-secondary-fixed text-primary';
  return (
    <div className={'flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold ' + tone}>
      {letters}
    </div>
  );
}

function formatJoined(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/* ─── Invite modal ──────────────────────────────────────────────────────── */

function InviteModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (invite: Invitation) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'clinician' | 'admin' | 'receptionist'>('clinician');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send invitation');
        setSubmitting(false);
        return;
      }
      // POST returns { invitation, token } — assemble the share URL.
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setInvitationUrl(`${origin}/signup?token=${data.token}`);
      onCreated(data.invitation);
    } catch {
      setError('Network error');
      setSubmitting(false);
    }
  }

  function copyUrl() {
    if (!invitationUrl) return;
    navigator.clipboard?.writeText(invitationUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-on-surface/45 px-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_40px_80px_rgba(0,23,54,0.3)]"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-6 py-4">
          <h2 className="text-[16px] font-bold tracking-tight">Invite to clinic</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!invitationUrl ? (
          <div className="space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface-variant">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="clinician@example.com"
                className="h-11 w-full rounded-xl border border-outline-variant/40 bg-surface px-3.5 text-[14px] outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface-variant">
                Role
              </label>
              <div className="flex gap-2">
                {(['clinician', 'admin', 'receptionist'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={
                      'flex-1 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-colors ' +
                      (role === r
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-outline-variant/40 bg-surface text-on-surface-variant hover:bg-surface-container')
                    }
                  >
                    <span className="capitalize">{r}</span>
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div className="rounded-lg border border-error/30 bg-error/8 px-3 py-2 text-[12px] text-error">
                {error}
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-on-surface-variant">
              They&apos;ll get an email with a one-time link. The link is unique and rate-limited;
              you can revoke it any time from the team table.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-xl border border-outline-variant/40 bg-surface px-4 text-[13px] font-semibold hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!email || submitting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-on-surface px-4 text-[13px] font-bold text-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Sending…' : 'Send invitation'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/8 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
              </div>
              <div className="text-[13px]">
                <p className="font-bold text-on-surface">Invitation created.</p>
                <p className="mt-0.5 text-[12px] text-on-surface-variant">
                  We&apos;ll email them. You can also share this link directly:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface p-1.5">
              <div className="flex-1 overflow-hidden truncate px-3 font-mono text-[12px]">
                {invitationUrl}
              </div>
              <button
                type="button"
                onClick={copyUrl}
                className={
                  'inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[12px] font-bold text-white transition-colors ' +
                  (copied ? 'bg-success' : 'bg-on-surface hover:bg-on-surface/90')
                }
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center rounded-xl bg-on-surface px-4 text-[13px] font-bold text-surface hover:bg-on-surface/90"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
