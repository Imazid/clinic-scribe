'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/Avatar';
import { LogOut, Search } from 'lucide-react';
import { SETTINGS_CATEGORIES, activeCategory } from '@/lib/settings/categories';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const clinic = useAuthStore((s) => s.clinic);
  const [query, setQuery] = useState('');

  const current = activeCategory(pathname);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SETTINGS_CATEGORIES;
    return SETTINGS_CATEGORIES.filter(
      (c) => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
    );
  }, [query]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  const displayName = lastName ? `Dr. ${lastName}` : firstName || 'Account';
  const roleLine = clinic?.name
    ? `${clinic.name}${profile?.role ? ` · ${capitalize(profile.role)}` : ''}`
    : profile?.role
      ? capitalize(profile.role)
      : '—';

  return (
    <div className="space-y-5">
      {/* ── Hero strip ────────────────────────────────────────────────── */}
      <div className="mesh-bg relative overflow-hidden rounded-3xl border border-outline-variant/60 bg-gradient-to-br from-surface-container-lowest to-surface-container-low px-7 py-6">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="eyebrow">Settings</p>
            <h1 className="mt-1.5 font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-on-surface">
              Everything about{' '}
              <span className="italic text-secondary">your Miraa.</span>
            </h1>
            <p className="mt-1 text-[13px] text-on-surface-variant">
              Profile, safety, integrations and the rest. Changes apply instantly.
            </p>
          </div>
          <div className="flex h-11 w-full max-w-sm items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <Search className="h-4 w-4 text-outline" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search settings"
              className="flex-1 border-none bg-transparent text-[13px] text-on-surface placeholder:text-outline focus:outline-none"
            />
            <span className="kbd">⌘.</span>
          </div>
        </div>
      </div>

      {/* ── Two-pane ──────────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left rail */}
        <aside
          className="sticky self-start rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-ambient-sm"
          style={{ top: 'calc(var(--header-height) + 1rem)' }}
        >
          <p className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.10em] text-outline">
            Categories
          </p>
          <ul className="space-y-0.5">
            {filtered.map((c) => {
              const isActive =
                c.href === '/settings' ? pathname === '/settings' : pathname.startsWith(c.href);
              const Icon = c.icon;
              return (
                <li key={c.id}>
                  <Link
                    href={c.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors',
                      isActive
                        ? 'bg-secondary-fixed font-semibold text-secondary'
                        : 'font-medium text-on-surface hover:bg-surface-container-low',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-secondary' : 'text-on-surface-variant',
                      )}
                    />
                    <span className="truncate">{c.label}</span>
                  </Link>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-xs text-outline">No matches</li>
            )}
          </ul>

          {/* Account chip */}
          <div className="mt-3 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3">
            <div className="flex items-center gap-2.5">
              <Avatar firstName={firstName} lastName={lastName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-on-surface">{displayName}</p>
                <p className="truncate text-[11px] text-outline">{roleLine}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-[9px] border border-outline-variant bg-surface-container-lowest text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Right pane */}
        <div className="min-w-0 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-ambient-sm">
          <header className="border-b border-outline-variant/60 px-7 py-6">
            <p className="eyebrow">{current.eyebrow}</p>
            <h2 className="mt-1 font-display text-[24px] font-semibold leading-tight tracking-[-0.02em] text-on-surface">
              {current.label}
            </h2>
            <p className="mt-1.5 text-[13px] text-on-surface-variant">{current.description}</p>
          </header>
          <div className="px-7 py-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
