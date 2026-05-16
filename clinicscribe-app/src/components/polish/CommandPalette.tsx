'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  CalendarPlus,
  FileClock,
  FileText,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Mic,
  Plug,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Global ⌘K / Ctrl-K command palette. Pixel-faithful to the design
 * package's `CommandPalette` polish screen. Mounted once at the app-layout
 * level so it's accessible from anywhere in `/app/(app)/*`.
 *
 * Open with ⌘K or Ctrl-K. Close with Esc or by clicking the backdrop.
 * Arrow keys move the selection; Enter activates.
 */
type Tone = 'default' | 'success' | 'warning';

type CommandItem = {
  id: string;
  group: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  shortcut?: string;
  tone?: Tone;
  run: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open/close on ⌘K / Ctrl-K, close on Esc.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isModK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
      if (isModK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Reset state + focus when opening.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Wait for the dialog to mount before focusing.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const items: CommandItem[] = useMemo(() => {
    const navigate = (href: string) => () => {
      setOpen(false);
      router.push(href);
    };
    return [
      // Actions
      { id: 'action-new-consultation', group: 'Actions', title: 'Start a new consultation', sub: 'Record or upload a session', icon: Mic, shortcut: '↵', run: navigate('/consultations/new') },
      { id: 'action-add-patient',      group: 'Actions', title: 'Add a new patient',         sub: 'Create a patient record',     icon: UserPlus, run: navigate('/patients/new') },
      { id: 'action-schedule',         group: 'Actions', title: 'Schedule a visit',          sub: 'Plan an upcoming consult',    icon: CalendarPlus, run: navigate('/calendar') },

      // Workflow
      { id: 'go-dashboard',  group: 'Workflow', title: 'Today',         sub: '⌘ 1',  icon: LayoutDashboard, run: navigate('/dashboard') },
      { id: 'go-prepare',    group: 'Workflow', title: 'Prepare',       sub: '⌘ 2',  icon: ListChecks,      run: navigate('/prepare') },
      { id: 'go-capture',    group: 'Workflow', title: 'Capture',       sub: '⌘ 3',  icon: Mic,             run: navigate('/capture') },
      { id: 'go-verify',     group: 'Workflow', title: 'Verify queue',  sub: '⌘ 4',  icon: ShieldCheck,     run: navigate('/verify') },
      { id: 'go-close',      group: 'Workflow', title: 'Close',         sub: '⌘ 5',  icon: ListChecks,      run: navigate('/close') },

      // Workspace
      { id: 'go-patients',     group: 'Workspace', title: 'All patients',   sub: 'Search patient records',  icon: Users,          run: navigate('/patients') },
      { id: 'go-templates',    group: 'Workspace', title: 'Templates',      sub: 'Note + letter templates', icon: FileText,       run: navigate('/templates') },
      { id: 'go-analytics',    group: 'Workspace', title: 'Analytics',      sub: 'Volumes + approval rate', icon: BarChart3,      run: navigate('/analytics') },
      { id: 'go-integrations', group: 'Workspace', title: 'Integrations',   sub: 'Connected services',      icon: Plug,           run: navigate('/integrations') },
      { id: 'go-audit',        group: 'Workspace', title: 'Audit log',      sub: 'Every action on file',    icon: FileClock,      run: navigate('/audit') },
      { id: 'go-team',         group: 'Workspace', title: 'Team',           sub: 'Invite + manage clinic',  icon: Users,          run: navigate('/settings/team') },
      { id: 'go-refer',        group: 'Workspace', title: 'Refer & earn',   sub: 'Give 3 months, get 3',    icon: Gift,           run: navigate('/refer') },
      { id: 'go-help',         group: 'Workspace', title: 'Help center',    sub: 'Guides + support',        icon: LifeBuoy,       run: navigate('/help') },
      { id: 'go-settings',     group: 'Workspace', title: 'Settings',       sub: '⌘ ,',                     icon: Settings,       run: navigate('/settings') },

      // Suggestions
      { id: 'suggest-status',  group: 'Suggestions', title: 'System status', sub: 'Live signal', icon: Activity, tone: 'success', run: navigate('/help') },
    ];
  }, [router]);

  // Fuzzy-ish filter — substring on title + sub + group.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.title} ${item.sub} ${item.group}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  // Group filtered results in stable order.
  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      if (!map.has(item.group)) {
        order.push(item.group);
        map.set(item.group, []);
      }
      map.get(item.group)!.push(item);
    }
    return order.map((group) => ({ group, items: map.get(group)! }));
  }, [filtered]);

  // Flatten back to a numeric index so arrow keys can walk linearly.
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Keep activeIndex valid when the filter changes.
  useEffect(() => {
    if (activeIndex >= flatItems.length) setActiveIndex(0);
  }, [flatItems.length, activeIndex]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(flatItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatItems.length) % Math.max(flatItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatItems[activeIndex]?.run();
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-on-surface/45 px-4 pt-[120px] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_40px_80px_rgba(0,23,54,0.30)]"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-outline-variant/40 px-5 py-4">
          <Search className="h-[18px] w-[18px] text-on-surface-variant" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything…"
            className="flex-1 border-none bg-transparent text-[16px] text-on-surface outline-none placeholder:text-on-surface-variant"
          />
          <span className="inline-flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <KBD>esc</KBD>
            <span>to close</span>
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] font-semibold text-on-surface">No matches.</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">
                Try a patient name, a note ID, or a route.
              </p>
            </div>
          ) : (
            grouped.map((g) => {
              const startIndex = flatItems.indexOf(g.items[0]);
              return (
                <div key={g.group}>
                  <p className="px-5 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-[0.10em] text-on-surface-variant">
                    {g.group}
                  </p>
                  {g.items.map((item, j) => {
                    const idx = startIndex + j;
                    const active = idx === activeIndex;
                    return (
                      <CommandRow
                        key={item.id}
                        item={item}
                        active={active}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => item.run()}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant/40 bg-surface px-5 py-2.5 text-[11px] text-on-surface-variant">
          <div className="flex gap-4">
            <span className="inline-flex items-center gap-1.5">
              <KBD>↑</KBD>
              <KBD>↓</KBD>
              navigate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <KBD>↵</KBD>
              select
            </span>
            <span className="inline-flex items-center gap-1.5">
              <KBD>⌘</KBD>
              <KBD>K</KBD>
              open
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Ask Miraa
          </span>
        </div>
      </div>
    </div>
  );
}

function CommandRow({
  item,
  active,
  onMouseEnter,
  onClick,
}: {
  item: CommandItem;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const toneColor =
    item.tone === 'success'
      ? 'text-success'
      : item.tone === 'warning'
        ? 'text-warning'
        : 'text-secondary';
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={
        'flex w-full items-center gap-3 border-l-2 px-5 py-2.5 text-left transition-colors ' +
        (active
          ? 'border-secondary bg-secondary/6'
          : 'border-transparent hover:bg-surface-container/50')
      }
    >
      <span
        className={
          'flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-secondary/8 ' + toneColor
        }
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block truncate text-[13px] font-semibold">{item.title}</span>
        <span className="block truncate text-[11px] text-on-surface-variant">{item.sub}</span>
      </span>
      {item.shortcut && <KBD>{item.shortcut}</KBD>}
    </button>
  );
}

function KBD({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-outline-variant/50 border-b-2 bg-surface-container-lowest px-1.5 font-mono text-[10px] font-semibold text-on-surface">
      {children}
    </span>
  );
}
