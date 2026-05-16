'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Palette,
  Plug,
  Shield,
  Sliders,
  User,
  Users,
} from 'lucide-react';

/**
 * Settings shell — left sidebar, right pane.
 *
 * Rail (left, 17rem): grounded card with a section list. Each row is icon
 * + label, no descriptions; the active row uses a filled slate-blue pill.
 *
 * Pane (right): owns ALL of its own chrome — a section header (eyebrow +
 * title + summary) followed by the child page's content. Children are
 * pure content blocks; they don't bring their own max-width / breadcrumb /
 * page-background, those live here.
 */

type SectionMeta = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Used in the right-pane header. */
  eyebrow: string;
  title: string;
  summary: string;
};

const SECTIONS: SectionMeta[] = [
  {
    href: '/settings',
    label: 'Overview',
    icon: LayoutDashboard,
    eyebrow: 'Settings',
    title: 'Account overview',
    summary: 'Your profile, clinic, and workflow preferences at a glance.',
  },
  {
    href: '/settings/profile',
    label: 'Profile',
    icon: User,
    eyebrow: 'You',
    title: 'Profile',
    summary: 'Personal details, specialty, and provider context.',
  },
  {
    href: '/settings/security',
    label: 'Security',
    icon: Shield,
    eyebrow: 'You',
    title: 'Security',
    summary: 'Sign-in controls, multi-factor authentication, and sessions.',
  },
  {
    href: '/settings/notifications',
    label: 'Notifications',
    icon: Bell,
    eyebrow: 'You',
    title: 'Notifications',
    summary: 'How Miraa reaches you — email, in-app, and quiet hours.',
  },
  {
    href: '/settings/team',
    label: 'Team',
    icon: Users,
    eyebrow: 'Clinic',
    title: 'Team',
    summary: 'Members, roles, and pending invitations.',
  },
  {
    href: '/settings/billing',
    label: 'Billing',
    icon: CreditCard,
    eyebrow: 'Clinic',
    title: 'Billing & subscription',
    summary: 'Plan, seats, payment method, and invoices.',
  },
  {
    href: '/settings/integrations',
    label: 'Integrations',
    icon: Plug,
    eyebrow: 'Clinic',
    title: 'Integrations',
    summary: 'EMR sync, calendar, and connected services.',
  },
  {
    href: '/settings/workflow',
    label: 'Workflow',
    icon: Sliders,
    eyebrow: 'Preferences',
    title: 'Workflow preferences',
    summary: 'How you step through capture, review, and approval.',
  },
  {
    href: '/settings/appearance',
    label: 'Appearance',
    icon: Palette,
    eyebrow: 'Preferences',
    title: 'Appearance',
    summary: 'Theme, density, and visual preferences.',
  },
  {
    href: '/settings/legal',
    label: 'Legal & privacy',
    icon: FileText,
    eyebrow: 'Reference',
    title: 'Legal & privacy',
    summary: 'Terms, privacy policy, and AI safety documents.',
  },
];

const GROUPS: Array<{ label: string; sections: SectionMeta[] }> = [
  { label: 'You',         sections: SECTIONS.filter((s) => s.eyebrow === 'You' || s.label === 'Overview') },
  { label: 'Clinic',      sections: SECTIONS.filter((s) => s.eyebrow === 'Clinic') },
  { label: 'Preferences', sections: SECTIONS.filter((s) => s.eyebrow === 'Preferences') },
  { label: 'Reference',   sections: SECTIONS.filter((s) => s.eyebrow === 'Reference') },
];

function isActive(pathname: string, href: string) {
  if (href === '/settings') return pathname === '/settings';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function activeSection(pathname: string): SectionMeta {
  // Prefer the most specific match (longest href) to avoid /settings matching
  // for /settings/billing.
  return (
    SECTIONS.filter((s) => isActive(pathname, s.href)).sort(
      (a, b) => b.href.length - a.href.length
    )[0] ?? SECTIONS[0]
  );
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const clinic = useAuthStore((s) => s.clinic);
  const profile = useAuthStore((s) => s.profile);
  const current = activeSection(pathname);

  const roleLabel =
    profile?.role === 'admin' ? 'Owner' : profile?.role ? capitalize(profile.role) : null;

  return (
    <div
      className="flex gap-6 items-start"
      style={{ flexDirection: 'row' }}
    >
      {/* ─── Sidebar ─── */}
      <aside
        className="
          shrink-0 self-start rounded-2xl border border-outline-variant/40 bg-surface-container-lowest
          shadow-[0_18px_40px_-12px_rgba(0,23,54,0.18),0_4px_12px_-4px_rgba(0,23,54,0.08)]
          sticky
          flex flex-col
        "
        style={{
          width: '17rem',
          top: 'calc(var(--header-height) + 1rem)',
          height: 'calc(100vh - var(--header-height) - 2rem)',
        }}
      >
        {/* Workspace header */}
        <div className="border-b border-outline-variant/40 px-4 pb-3.5 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
            Settings
          </p>
          <p className="mt-1.5 truncate font-display text-[17px] font-semibold leading-tight tracking-[-0.02em] text-on-surface">
            {clinic?.name ?? 'Your workspace'}
          </p>
          {roleLabel && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {roleLabel}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-outline">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.sections.map((section) => {
                  const active = isActive(pathname, section.href);
                  const Icon = section.icon;
                  return (
                    <li key={section.href}>
                      <Link
                        href={section.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-colors',
                          active
                            ? 'bg-on-surface text-surface'
                            : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-[3px] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-secondary"
                          />
                        )}
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            active ? 'text-surface' : 'text-on-surface-variant group-hover:text-on-surface'
                          )}
                        />
                        <span className="flex-1 truncate">{section.label}</span>
                        <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 transition-opacity',
                            active ? 'text-surface/70' : 'text-outline opacity-0 group-hover:opacity-100'
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-outline-variant/40 px-3 py-3">
          <Link
            href="/help"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container/60 hover:text-on-surface"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span className="flex-1">Need help?</span>
            <ChevronRight className="h-3 w-3 text-outline" />
          </Link>
        </div>
      </aside>

      {/* ─── Right pane ─── */}
      <div
        className="min-w-0 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_12px_28px_-12px_rgba(0,23,54,0.10)]"
        style={{ flex: '1 1 0%' }}
      >
        <header className="border-b border-outline-variant/40 px-7 py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
            {current.eyebrow}
          </p>
          <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">
            {current.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-on-surface-variant">{current.summary}</p>
        </header>
        <div className="px-7 py-7">{children}</div>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
