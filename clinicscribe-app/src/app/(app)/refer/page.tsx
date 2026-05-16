'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Filter,
  Gift,
  Lightbulb,
  Linkedin,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  QrCode,
  Send,
  Trophy,
  X,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Referral page — live data from `/api/refer/{state,invite}`.
 *
 * On mount: GET /api/refer/state returns the clinician's permalink slug,
 * earnings, stats, and recent invitees. Submitting the form POSTs to
 * /api/refer/invite which inserts referral rows (idempotent on
 * (referrer, email)) and we refresh the list.
 *
 * Email delivery isn't wired yet — for now the "Send invites" CTA creates
 * the referral row and the user shares the link from the copy field. When
 * the mailer ships, the same POST will trigger send.
 */

type ReferralStatus = 'invited' | 'signed_up' | 'activated' | 'revoked' | 'expired';

interface ReferralRow {
  id: string;
  invitee_email: string;
  status: ReferralStatus;
  invited_at: string;
  signed_up_at: string | null;
  activated_at: string | null;
  expires_at: string;
}

interface ReferState {
  slug: string | null;
  stats: { invited: number; joined: number; pending: number };
  earnings: { months_earned: number; months_pending: number };
  invitees: ReferralRow[];
}

const DEFAULT_MESSAGE =
  "Hey — thought you might like Miraa. It records consults and drafts the notes while you focus on the patient. If you sign up through my link, we both get 3 months free.";

export default function ReferPage() {
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [pendingEmail, setPendingEmail] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [state, setState] = useState<ReferState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/refer/state', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoadError(data.error || 'Could not load referral state');
        return;
      }
      const data = (await res.json()) as ReferState;
      setState(data);
      setLoadError(null);
    } catch {
      setLoadError('Network error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shareUrl = useMemo(() => {
    if (!state?.slug) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://miraa.health';
    return `${origin}/r/${state.slug}`;
  }, [state?.slug]);

  const shareDisplay = useMemo(() => {
    if (!shareUrl) return 'Loading your link…';
    return shareUrl.replace(/^https?:\/\//, '');
  }, [shareUrl]);

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function commitEmail() {
    const trimmed = pendingEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    if (emails.includes(trimmed)) return;
    setEmails([...emails, trimmed]);
    setPendingEmail('');
  }

  function removeEmail(target: string) {
    setEmails(emails.filter((e) => e !== target));
  }

  async function submit() {
    // Allow Enter on the input + click on the button — both flow through.
    if (pendingEmail.trim()) commitEmail();
    const finalEmails = pendingEmail.trim() && !emails.includes(pendingEmail.trim())
      ? [...emails, pendingEmail.trim()]
      : emails;
    if (finalEmails.length === 0) {
      setSendError('Add at least one email.');
      return;
    }
    setSending(true);
    setSendError(null);
    setSentCount(null);
    try {
      const res = await fetch('/api/refer/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: finalEmails, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || 'Could not send invites.');
        setSending(false);
        return;
      }
      setSentCount(data.invitations?.length ?? finalEmails.length);
      setEmails([]);
      setPendingEmail('');
      // Reload state to surface the new referral rows in the table.
      await load();
    } catch {
      setSendError('Network error.');
    } finally {
      setSending(false);
    }
  }

  const stats = state?.stats ?? { invited: 0, joined: 0, pending: 0 };
  const earnings = state?.earnings ?? { months_earned: 0, months_pending: 0 };

  return (
    <div className="min-h-full bg-surface text-on-surface">
      {/* Breadcrumb bar */}
      <div className="flex items-center justify-between border-b border-outline-variant/40 px-10 py-6">
        <div className="flex items-center gap-2.5 text-[13px]">
          <ArrowLeft className="h-4 w-4 text-on-surface-variant" />
          <Link href="/settings" className="text-on-surface-variant hover:text-on-surface">
            Settings
          </Link>
          <span className="text-outline">/</span>
          <span className="font-semibold">Refer a colleague</span>
        </div>
        <div className="flex items-center gap-3">
          {earnings.months_earned > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
              <Check className="h-3 w-3" />
              {earnings.months_earned} month{earnings.months_earned === 1 ? '' : 's'} earned
            </span>
          )}
          <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3.5 text-[13px] font-semibold hover:bg-surface-container">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Program details
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-10 pb-16 pt-9">
        {loadError && (
          <div className="mb-5 rounded-2xl border border-error/30 bg-error/8 px-4 py-3 text-[13px] text-error">
            {loadError}
          </div>
        )}

        {/* Hero */}
        <ReferralHero earnings={earnings} stats={stats} />

        {/* Share + side column */}
        <div className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Share block */}
          <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient-sm">
            <div className="px-6 pt-6">
              <p className="eyebrow mb-1 text-secondary">Your link</p>
              <h2 className="text-xl font-bold tracking-tight">Share with a colleague</h2>
              <p className="mt-1 text-[13px] text-on-surface-variant">
                This link is unique to you. It expires never.
              </p>
            </div>

            {/* Copy row */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-0 rounded-2xl border border-outline-variant/40 bg-surface p-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                  <LinkIcon className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1 overflow-hidden truncate px-3.5 font-mono text-[14px] font-semibold tracking-tight">
                  {shareDisplay}
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!shareUrl}
                  className={
                    'inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-[13px] font-bold text-white transition-colors disabled:opacity-50 ' +
                    (copied ? 'bg-success' : 'bg-on-surface hover:bg-on-surface/90')
                  }
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={2.6} />
                  )}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </div>

            {/* Quick share */}
            <div className="grid grid-cols-2 gap-2.5 px-6 pt-3.5 sm:grid-cols-4">
              <ShareButton icon={Mail} label="Email" filled />
              <ShareButton icon={MessageSquare} label="SMS" />
              <ShareButton icon={Linkedin} label="LinkedIn" />
              <ShareButton icon={QrCode} label="QR code" />
            </div>

            {/* Email composer */}
            <div className="mt-3.5 border-t border-outline-variant/40 px-6 pb-6 pt-5">
              <p className="eyebrow mb-2.5 text-on-surface-variant">Send an invite by email</p>
              <div className="flex flex-col gap-2.5">
                <div className="flex min-h-[50px] flex-wrap items-center gap-1.5 rounded-xl border border-outline-variant/40 bg-surface px-3 py-2">
                  {emails.map((email) => (
                    <EmailChip key={email} onRemove={() => removeEmail(email)}>
                      {email}
                    </EmailChip>
                  ))}
                  <input
                    value={pendingEmail}
                    onChange={(e) => setPendingEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                        e.preventDefault();
                        commitEmail();
                      } else if (e.key === 'Backspace' && !pendingEmail && emails.length) {
                        removeEmail(emails[emails.length - 1]);
                      }
                    }}
                    onBlur={commitEmail}
                    placeholder="Add another email…"
                    className="min-w-[180px] flex-1 border-none bg-transparent py-1 text-[13px] outline-none"
                  />
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[96px] resize-y rounded-xl border border-outline-variant/40 bg-surface p-3.5 text-[13px] leading-relaxed outline-none focus:border-secondary"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-on-surface-variant">
                    {sentCount !== null ? (
                      <span className="font-semibold text-success">
                        {sentCount} invite{sentCount === 1 ? '' : 's'} created. Copy your link to share.
                      </span>
                    ) : sendError ? (
                      <span className="font-semibold text-error">{sendError}</span>
                    ) : (
                      'Personalising the message lifts join rate by ~3×.'
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending || (emails.length === 0 && !pendingEmail.trim())}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-secondary px-4 text-[13px] font-bold text-on-secondary shadow-lg shadow-secondary/25 transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? 'Sending…' : 'Send invites'}
                    <Send className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient-sm">
              <div className="flex items-center justify-between px-5 py-5">
                <div>
                  <p className="eyebrow mb-1 text-warning">Your tally</p>
                  <p className="text-base font-bold">Lifetime</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
                  <Trophy className="h-3 w-3" />
                  {stats.invited} sent
                </span>
              </div>
              <div className="px-5 pb-5">
                <SummaryRow label="Activated" value={stats.joined} tone="success" detail={`+${stats.joined * 3} months credited`} />
                <SummaryRow label="Trialing" value={stats.pending} tone="warning" detail="Awaiting first week" />
                <SummaryRow label="Pending opens" value={Math.max(0, stats.invited - stats.joined - stats.pending)} tone="default" detail="Sent, not signed up" last />
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-bold">One simple tip</p>
                  <p className="text-[12px] leading-relaxed text-on-surface-variant">
                    A clinician who sees Miraa work in a real consult is 4× more likely to sign up.
                    Loan them your link, run one consult together, then send the invite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invited table */}
        <div className="mt-7">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-1 text-secondary">Invites</p>
              <h2 className="text-xl font-bold tracking-tight">People you&apos;ve invited</h2>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3.5 text-[12px] font-semibold hover:bg-surface-container">
                <Filter className="h-3.5 w-3.5" />
                All statuses
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3.5 text-[12px] font-semibold hover:bg-surface-container">
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_120px] gap-3.5 border-b border-outline-variant/40 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              <div>Invitee</div>
              <div>Invited</div>
              <div>Reward</div>
              <div>Status</div>
            </div>
            {state === null && !loadError && (
              <div className="px-5 py-10 text-center text-[13px] text-on-surface-variant">Loading…</div>
            )}
            {state && state.invitees.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] font-semibold">No invites yet.</p>
                <p className="mt-1 text-[12px] text-on-surface-variant">
                  Send your first invite above — they show up here the moment they&apos;re queued.
                </p>
              </div>
            )}
            {state?.invitees.map((inv, idx) => {
              const earned = computeEarned(inv.status);
              return (
                <div
                  key={inv.id}
                  className={
                    'grid grid-cols-[2fr_1fr_1fr_120px] items-center gap-3.5 px-5 py-3.5 text-[13px]' +
                    (idx < state.invitees.length - 1 ? ' border-b border-outline-variant/40' : '')
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <EmailAvatar email={inv.invitee_email} />
                    <span className="truncate font-mono text-[12.5px] font-semibold">{inv.invitee_email}</span>
                  </div>
                  <div className="text-[12px] text-on-surface-variant">{formatDate(inv.invited_at)}</div>
                  <div
                    className={
                      'font-bold ' +
                      (earned.tone === 'success'
                        ? 'text-success'
                        : earned.tone === 'warning'
                          ? 'text-warning'
                          : 'text-on-surface-variant')
                    }
                  >
                    {earned.label}
                  </div>
                  <div>
                    <StatusPill status={inv.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <p className="eyebrow mb-1 text-secondary">FAQ</p>
          <h2 className="text-xl font-bold tracking-tight">Common questions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4"
              >
                <p className="mb-1.5 text-[14px] font-bold">{item.q}</p>
                <p className="text-[12px] leading-relaxed text-on-surface-variant">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */

function ReferralHero({
  earnings,
  stats,
}: {
  earnings: { months_earned: number; months_pending: number };
  stats: { invited: number; joined: number; pending: number };
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-12 text-white shadow-[0_24px_60px_rgba(0,23,54,0.30)]"
      style={{
        background: 'linear-gradient(135deg, #001736 0%, #003355 50%, #1F5C7C 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(232,219,200,0.22), transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)',
        }}
      />

      <Coin className="absolute right-56 top-9 -rotate-12" />
      <Coin small className="absolute bottom-9 right-20 rotate-[18deg] scale-90" />
      <Coin small className="absolute right-14 top-28 rotate-6 scale-75" />

      <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(232,219,200,0.18)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#E8DBC8]">
            <Gift className="h-3 w-3" />
            Refer a colleague
          </div>
          <h1 className="font-display text-[60px] font-medium leading-none tracking-[-0.03em]">
            Give 3 months.
            <br />
            <span className="italic text-[#E8DBC8]">Get 3 months.</span>
          </h1>
          <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-white/80">
            When a clinician you invite finishes their first week with Miraa, both of you get three
            months on us. No cap. Stack as many as you like.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3" style={{ maxWidth: 540 }}>
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-xl border border-white/15 bg-white/[0.08] p-3.5 backdrop-blur-md"
              >
                <p className="font-mono text-[11px] font-bold tracking-wider text-[#E8DBC8]">{s.n}</p>
                <p className="mt-1 text-[13px] font-bold">{s.t}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/20 bg-white/[0.10] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.20)] backdrop-blur-2xl">
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8DBC8]">
            Your earnings
          </p>
          <div className="flex items-baseline gap-2.5">
            <div className="font-display text-[72px] font-medium leading-none tracking-[-0.03em] text-white">
              {earnings.months_earned}
            </div>
            <span className="text-[14px] text-white/80">
              month{earnings.months_earned === 1 ? '' : 's'} free, credited
            </span>
          </div>
          <p className="mt-1.5 text-[12px] text-white/60">
            {earnings.months_pending > 0
              ? `+ ${earnings.months_pending} month${earnings.months_pending === 1 ? '' : 's'} pending · activates after first week`
              : 'Send your first invite to start earning.'}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4">
            {[
              { v: stats.invited, k: 'Invited' },
              { v: stats.joined,  k: 'Joined' },
              { v: stats.pending, k: 'Pending' },
            ].map((m) => (
              <div key={m.k}>
                <p className="font-display text-[22px] font-bold leading-none tracking-tight">{m.v}</p>
                <p className="mt-1 text-[11px] text-white/70">{m.k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { n: '01', t: 'Share your link', d: 'Email, WhatsApp, anywhere.' },
  { n: '02', t: 'They sign up',     d: 'Free trial activates with 3 months built in.' },
  { n: '03', t: 'Both credited',    d: 'After their first week using Miraa.' },
] as const;

const FAQ = [
  {
    q: 'When am I credited?',
    a: 'After the clinician you invited has used Miraa for their first 7 days. We email you both the moment it happens.',
  },
  {
    q: 'Is there a cap?',
    a: 'No. Refer five clinicians, get 15 months. Refer twenty, get five years. We do not auto-bill on a card we don’t have.',
  },
  {
    q: 'Who can I refer?',
    a: 'Any practicing clinician — GPs, specialists, allied health, psychiatrists. They’ll need to verify with AHPRA on sign-up.',
  },
  {
    q: 'What if they already trialed?',
    a: 'Existing trialers are not eligible. We’ll let them know when they tap your link so there are no awkward surprises.',
  },
];

/* ─── Bits ──────────────────────────────────────────────────────────────── */

function Coin({ small, className }: { small?: boolean; className?: string }) {
  const size = small ? 70 : 110;
  const inner = small ? 28 : 44;
  return (
    <div
      aria-hidden="true"
      className={'pointer-events-none flex items-center justify-center rounded-full border-[2px] border-[rgba(255,224,160,0.6)] shadow-[0_12px_32px_rgba(0,0,0,0.30),inset_0_-4px_8px_rgba(0,0,0,0.18),inset_0_4px_8px_rgba(255,255,255,0.35)] ' + (className ?? '')}
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 25%, #FFE0A0 0%, #C98600 60%, #6B4500 100%)',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: inner,
        fontWeight: 700,
        color: '#6B4500',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)',
      }}
    >
      <span className="relative">
        m
        <span
          className="absolute -right-2.5 -top-2 flex items-center justify-center rounded-full border-[2px] border-[#FFE0A0] bg-white font-bold not-italic text-success"
          style={{
            width: small ? 18 : 24,
            height: small ? 18 : 24,
            fontFamily: 'var(--font-body)',
            fontSize: small ? 9 : 11,
          }}
        >
          3m
        </span>
      </span>
    </div>
  );
}

function ShareButton({
  icon: Icon,
  label,
  filled,
}: {
  icon: typeof Mail;
  label: string;
  filled?: boolean;
}) {
  return (
    <button
      className={
        'inline-flex h-[50px] items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-colors ' +
        (filled
          ? 'bg-on-surface text-surface hover:bg-on-surface/90'
          : 'border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container')
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function EmailChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/12 px-2.5 py-1 font-mono text-[12px] font-semibold text-secondary">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="rounded-full text-secondary/70 hover:text-secondary"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function EmailAvatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-[11px] font-mono font-semibold text-primary">
      {initials}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  detail,
  tone,
  last,
}: {
  label: string;
  value: number;
  detail: string;
  tone: 'success' | 'warning' | 'default';
  last?: boolean;
}) {
  const valueColor =
    tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-on-surface';
  return (
    <div className={'flex items-center gap-3 py-2.5 text-[13px]' + (last ? '' : ' border-b border-outline-variant/40')}>
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-[11px] text-on-surface-variant">{detail}</p>
      </div>
      <span className={'font-display text-[20px] font-bold leading-none tracking-tight ' + valueColor}>{value}</span>
    </div>
  );
}

function computeEarned(status: ReferralStatus): { label: string; tone: 'success' | 'warning' | 'default' } {
  switch (status) {
    case 'activated':
      return { label: '3 mo', tone: 'success' };
    case 'signed_up':
      return { label: 'pending', tone: 'warning' };
    case 'invited':
    default:
      return { label: '—', tone: 'default' };
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

function StatusPill({ status }: { status: ReferralStatus }) {
  if (status === 'activated') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Joined
      </span>
    );
  }
  if (status === 'signed_up') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Trialing
      </span>
    );
  }
  if (status === 'revoked' || status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1 text-[11px] font-semibold text-error">
        <span className="h-1.5 w-1.5 rounded-full bg-error" />
        {status === 'revoked' ? 'Revoked' : 'Expired'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
      <span className="h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
      Invited
    </span>
  );
}
