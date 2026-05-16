'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Global keyboard-shortcuts cheat sheet. Triggered by pressing `?` when no
 * input is focused. Pixel-faithful to the design package's
 * `ShortcutsCheatSheet` polish screen.
 */
type Section = { title: string; rows: Array<{ label: string; keys: string[] }> };

const SECTIONS: Section[] = [
  {
    title: 'Navigation',
    rows: [
      { label: 'Open command palette', keys: ['⌘', 'K'] },
      { label: 'Show this cheat sheet', keys: ['?'] },
      { label: 'Today',          keys: ['⌘', '1'] },
      { label: 'Capture',        keys: ['⌘', '2'] },
      { label: 'Verify',         keys: ['⌘', '3'] },
      { label: 'Patients',       keys: ['⌘', '4'] },
      { label: 'Settings',       keys: ['⌘', ','] },
    ],
  },
  {
    title: 'Capture',
    rows: [
      { label: 'Start / pause recording', keys: ['Space'] },
      { label: 'Stop & process',          keys: ['⌘', '↵'] },
      { label: 'Toggle live transcript',  keys: ['⌘', 'L'] },
    ],
  },
  {
    title: 'Verify',
    rows: [
      { label: 'Next finding',     keys: ['j'] },
      { label: 'Previous finding', keys: ['k'] },
      { label: 'Resolve finding',  keys: ['r'] },
      { label: 'Approve note',     keys: ['⌘', '↵'] },
    ],
  },
  {
    title: 'General',
    rows: [
      { label: 'Search this page', keys: ['/'] },
      { label: 'Open notifications', keys: ['n'] },
      { label: 'Sign out', keys: ['⌘', '⇧', 'Q'] },
    ],
  },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in an input/textarea/contenteditable.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable = target?.isContentEditable;
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable;

      if (!inField && e.key === '?' && !e.metaKey && !e.ctrlKey) {
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

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-on-surface/45 px-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[720px] overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_40px_80px_rgba(0,23,54,0.30)]"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-6 py-4">
          <div>
            <p className="eyebrow text-secondary">Reference</p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight">Keyboard shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-x-6 gap-y-5 p-6 md:grid-cols-2">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.10em] text-on-surface-variant">
                {section.title}
              </p>
              <div className="rounded-xl border border-outline-variant/40 bg-surface">
                {section.rows.map((row, idx) => (
                  <div
                    key={row.label}
                    className={
                      'flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px]' +
                      (idx < section.rows.length - 1 ? ' border-b border-outline-variant/40' : '')
                    }
                  >
                    <span>{row.label}</span>
                    <span className="flex items-center gap-1">
                      {row.keys.map((k, i) => (
                        <KBD key={`${row.label}-${k}-${i}`}>{k}</KBD>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-outline-variant/40 bg-surface px-6 py-3 text-[11px] text-on-surface-variant">
          Press <KBD>?</KBD> any time to bring this back up. Press <KBD>esc</KBD> to dismiss.
        </div>
      </div>
    </div>
  );
}

function KBD({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 min-w-[22px] items-center justify-center rounded-md border border-outline-variant/50 border-b-2 bg-surface-container-lowest px-1.5 font-mono text-[11px] font-semibold text-on-surface">
      {children}
    </span>
  );
}
