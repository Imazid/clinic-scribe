'use client';

import {
  BookOpen,
  ChevronRight,
  CreditCard,
  FileText,
  Keyboard,
  Lock,
  MessageCircle,
  Mic,
  Plug,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Help center — pixel-faithful to the design package's `HelpCenter` polish
 * screen. Static content for now; the search bar is a placeholder for a
 * future Miraa-AI assist route.
 */
export default function HelpPage() {
  return (
    <div className="min-h-full bg-surface text-on-surface">
      {/* Hero */}
      <div
        className="border-b border-outline-variant/40 px-10 pb-9 pt-12 text-center"
        style={{
          background:
            'linear-gradient(180deg, var(--color-surface-container-lowest) 0%, var(--color-surface) 100%)',
        }}
      >
        <p className="eyebrow text-secondary">Support</p>
        <h1 className="mt-2 font-display text-[44px] font-medium leading-tight tracking-[-0.03em]">
          How can we <span className="italic text-secondary">help?</span>
        </h1>
        <div className="relative mx-auto mt-6 max-w-[540px]">
          <input
            placeholder="Search help articles, shortcuts, or ask Miraa anything…"
            className="h-14 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-5 pr-14 text-[15px] outline-none shadow-[0_8px_24px_rgba(0,23,54,0.06)] focus:border-secondary"
          />
          <button
            type="button"
            aria-label="Ask Miraa"
            className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-on-surface text-surface"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-[12px] text-on-surface-variant">
          Powered by Miraa AI · Try &ldquo;How do I add a custom template?&rdquo;
        </p>
      </div>

      <div className="mx-auto max-w-[1100px] px-10 pb-16 pt-8">
        {/* Quick actions */}
        <p className="eyebrow mb-2.5 text-on-surface-variant">Quick actions</p>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={MessageCircle} title="Chat with us" sub="Avg reply: 4 min" live />
          <QuickAction icon={Video}         title="Book a demo"  sub="15 mins · with a clinician" />
          <QuickAction icon={BookOpen}      title="Read the guide" sub="12 articles · 8 mins" />
          <QuickAction icon={Keyboard}      title="Shortcuts"    sub="Press ? anywhere" />
        </div>

        {/* Categories */}
        <p className="eyebrow mb-2.5 text-on-surface-variant">Browse topics</p>
        <div className="mb-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.t}
              href="#"
              className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container"
            >
              <div className={'flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-secondary/10 ' + c.color}>
                <c.icon className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold">{c.t}</p>
                <p className="text-[11px] text-on-surface-variant">{c.count} articles</p>
              </div>
              <ChevronRight className="h-4 w-4 text-on-surface-variant" />
            </Link>
          ))}
        </div>

        {/* Popular */}
        <p className="eyebrow mb-2.5 text-on-surface-variant">Most read this week</p>
        <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
          {ARTICLES.map((a, idx) => (
            <Link
              key={a.title}
              href="#"
              className={
                'flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-container' +
                (idx < ARTICLES.length - 1 ? ' border-b border-outline-variant/40' : '')
              }
            >
              <span className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-bold">{a.title}</p>
                <p className="mt-0.5 text-[12px] text-on-surface-variant">
                  {a.category} · {a.minutes} min read
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 text-on-surface-variant" />
            </Link>
          ))}
        </div>

        {/* Status strip */}
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <div>
              <p className="text-[13px] font-bold">All systems operational</p>
              <p className="text-[11px] text-on-surface-variant">Transcription, note generation, and exports green.</p>
            </div>
          </div>
          <Link href="#" className="text-[13px] font-semibold text-secondary hover:underline">
            View status page →
          </Link>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { icon: Mic,         t: 'Recording consults', count: 14, color: 'text-secondary' },
  { icon: ShieldCheck, t: 'AI safety & flags',  count: 9,  color: 'text-success' },
  { icon: Plug,        t: 'EMR & integrations', count: 12, color: 'text-warning' },
  { icon: FileText,    t: 'Templates & notes',  count: 18, color: 'text-secondary' },
  { icon: Lock,        t: 'Privacy & data',     count: 7,  color: 'text-error' },
  { icon: CreditCard,  t: 'Billing & plans',    count: 8,  color: 'text-on-surface-variant' },
];

const ARTICLES = [
  { title: 'How to add a custom note template', category: 'Templates', minutes: 3 },
  { title: 'What happens when Miraa flags a finding', category: 'AI safety', minutes: 4 },
  { title: 'Connecting Best Practice to Miraa', category: 'Integrations', minutes: 6 },
  { title: 'Reviewing and approving a consultation note', category: 'Verify', minutes: 5 },
  { title: 'Where consultation audio is stored', category: 'Privacy', minutes: 4 },
];

function QuickAction({
  icon: Icon,
  title,
  sub,
  live,
}: {
  icon: typeof MessageCircle;
  title: string;
  sub: string;
  live?: boolean;
}) {
  return (
    <button
      type="button"
      className="flex flex-col gap-2.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 text-left transition-colors hover:bg-surface-container"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Icon className="h-[17px] w-[17px]" />
        </div>
        {live && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Live
          </span>
        )}
      </div>
      <div>
        <p className="text-[14px] font-bold">{title}</p>
        <p className="mt-0.5 text-[12px] text-on-surface-variant">{sub}</p>
      </div>
    </button>
  );
}
