'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSidebarCounts } from '@/lib/hooks/useSidebarCounts';
import { SECONDARY_NAV, WORKFLOW_NAV } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  BarChart3,
  Plug,
  Pill,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Mic,
  ShieldCheck,
  ListChecks,
  FileClock,
  ClipboardList,
  Stethoscope,
  LayoutTemplate,
  ListTodo,
  Plus,
  Gift,
  LifeBuoy,
  ChevronUp,
  LogOut,
  UserRound,
} from 'lucide-react';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  BarChart3,
  Plug,
  Pill,
  Settings,
  Mic,
  ShieldCheck,
  ListChecks,
  FileClock,
  ClipboardList,
  Stethoscope,
  LayoutTemplate,
  ListTodo,
  Gift,
  LifeBuoy,
};

const BADGE_MAP: Record<string, keyof ReturnType<typeof useSidebarCounts>> = {
  '/prepare': 'prepare',
  '/verify': 'verify',
  '/close': 'close',
};

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const counts = useSidebarCounts();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col transition-all duration-300',
          collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-[var(--header-height)] flex items-center px-5 border-b border-outline-variant/30">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="Go to Miraa dashboard">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-on-secondary" />
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-primary whitespace-nowrap">Miraa</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-surface-container-high"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Start consultation CTA */}
        <div className="px-3 mt-4">
          {collapsed ? (
            <Link
              href="/consultations/new"
              onClick={() => setSidebarMobileOpen(false)}
              title="Start consultation (⌘N)"
              className="relative flex items-center justify-center mx-auto w-10 h-10 rounded-xl bg-primary text-on-primary shadow-ambient-sm hover:bg-primary-container transition-all overflow-hidden"
            >
              <span className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse-slow" />
              <Plus className="w-5 h-5 relative" />
            </Link>
          ) : (
            <Link
              href="/consultations/new"
              onClick={() => setSidebarMobileOpen(false)}
              className="relative flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-ambient-sm hover:-translate-y-px hover:bg-primary-container hover:shadow-ambient active:translate-y-0 transition-all overflow-hidden"
            >
              <span className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse-slow" />
              <Plus className="w-4 h-4 relative" />
              <span className="relative flex-1 text-left">Start consultation</span>
              <span
                aria-hidden="true"
                className="relative inline-flex h-5 items-center rounded-md border border-white/15 bg-white/10 px-1.5 font-mono text-[10px] font-semibold tracking-tight text-on-primary/85"
              >
                ⌘N
              </span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            {!collapsed && (
              <p className="label-text px-3 text-outline">Workflow</p>
            )}
            {WORKFLOW_NAV.map((item) => {
              const Icon = icons[item.icon];
              const isActive = pathname.startsWith(item.href);
              const badge =
                'badge' in item && typeof item.badge === 'string' ? item.badge : null;
              const countKey = BADGE_MAP[item.href];
              const count = countKey ? counts[countKey] : 0;
              // Verify queue is the only badge that maps to a real backlog
              // (overdue review). Everything else surfaces as the neutral
              // active-tone chip even when count > 0.
              const isOverdueBadge = item.href === '/verify';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarMobileOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                    isActive
                      ? 'bg-secondary/10 text-secondary font-semibold'
                      : 'font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )}
                >
                  <motion.span
                    whileHover={{ scale: 1.15, rotate: 3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="relative shrink-0"
                  >
                    {Icon && <Icon className={cn('w-5 h-5', isActive && 'text-secondary')} />}
                    {collapsed && count > 0 && (
                      <span
                        className={cn(
                          'absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center',
                          isOverdueBadge ? 'bg-error' : 'bg-secondary',
                        )}
                      >
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </motion.span>
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      {count > 0 ? (
                        <span
                          className={cn(
                            'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold min-w-[20px] text-center',
                            isOverdueBadge
                              ? 'bg-error/10 text-error'
                              : isActive
                                ? 'bg-secondary text-on-secondary'
                                : 'bg-surface-container-high text-on-surface-variant',
                          )}
                        >
                          {count}
                        </span>
                      ) : badge ? (
                        <span className="ml-auto rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-outline">
                          {badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            {!collapsed && (
              <p className="label-text px-3 text-outline">Workspace</p>
            )}
            {SECONDARY_NAV.map((item) => {
              const Icon = icons[item.icon];
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarMobileOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                    isActive
                      ? 'bg-secondary/10 text-secondary font-semibold'
                      : 'font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )}
                >
                  <motion.span
                    whileHover={{ scale: 1.15, rotate: 3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="shrink-0"
                  >
                    {Icon && <Icon className={cn('w-5 h-5', isActive && 'text-secondary')} />}
                  </motion.span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User chip + collapse toggle */}
        <UserChip collapsed={collapsed} />
        <div className="hidden lg:flex p-3 border-t border-outline-variant/30">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    </>
  );
}

function UserChip({ collapsed }: { collapsed: boolean }) {
  const profile = useAuthStore((s) => s.profile);
  const clinic = useAuthStore((s) => s.clinic);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  const displayName = lastName ? `Dr. ${lastName}` : firstName || 'Account';
  const clinicLine = clinic?.name ?? 'No clinic';

  if (collapsed) {
    return (
      <div className="px-3 pb-2 pt-3 border-t border-outline-variant/30">
        <Link
          href="/settings/profile"
          title={displayName}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
        >
          <Avatar firstName={firstName} lastName={lastName} size="sm" />
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative px-3 pt-3 pb-2 border-t border-outline-variant/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-left transition-colors hover:bg-surface-container"
      >
        <Avatar firstName={firstName} lastName={lastName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-on-surface">{displayName}</p>
          <p className="truncate text-[11px] text-outline">{clinicLine}</p>
        </div>
        <ChevronUp
          className={cn(
            'h-4 w-4 shrink-0 text-on-surface-variant transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+0.25rem)] left-3 right-3 z-50 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-ambient-lg">
          <Link
            href="/settings/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
          >
            <UserRound className="h-4 w-4 text-on-surface-variant" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
          >
            <Settings className="h-4 w-4 text-on-surface-variant" />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 border-t border-outline-variant/40 px-3 py-2.5 text-sm text-error hover:bg-error/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
