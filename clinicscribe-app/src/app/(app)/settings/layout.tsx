'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building,
  ChevronRight,
  CreditCard,
  FileText,
  Palette,
  Settings2,
  Shield,
  User,
} from 'lucide-react';

type SettingsNavItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  disabled?: boolean;
};

const SETTINGS_GROUPS: Array<{ label: string; items: SettingsNavItem[] }> = [
  {
    label: 'Personal',
    items: [
      {
        label: 'Account',
        description: 'Overview and clinic identity',
        icon: User,
        href: '/settings',
      },
      {
        label: 'Profile',
        description: 'Personal details and specialty',
        icon: User,
        href: '/settings/profile',
      },
    ],
  },
  {
    label: 'Billing & Access',
    items: [
      {
        label: 'Billing',
        description: 'Subscription, seats, and invoices',
        icon: CreditCard,
        href: '/settings/billing',
      },
      {
        label: 'Notifications',
        description: 'Email and workflow alerts',
        icon: Bell,
        disabled: true,
      },
      {
        label: 'Security',
        description: 'Sessions and sign-in controls',
        icon: Shield,
        disabled: true,
      },
    ],
  },
  {
    label: 'Compliance',
    items: [
      {
        label: 'Legal & Privacy',
        description: 'Privacy policy, terms, and AI safety documents',
        icon: FileText,
        href: '/settings/legal',
      },
    ],
  },
  {
    label: 'Clinic',
    items: [
      {
        label: 'Clinic',
        description: 'Organisation and clinic preferences',
        icon: Building,
        disabled: true,
      },
      {
        label: 'Appearance',
        description: 'Theme and display preferences',
        icon: Palette,
        disabled: true,
      },
    ],
  },
];

function isActivePath(pathname: string, href?: string) {
  if (!href) return false;
  if (href === '/settings') return pathname === '/settings';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return SETTINGS_GROUPS;
    }

    return SETTINGS_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        [item.label, item.description, group.label]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="xl:sticky xl:top-6 self-start rounded-[1.75rem] border border-outline-variant/50 bg-surface-container-lowest p-4 shadow-ambient-sm">
        <div className="mb-4 px-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-on-surface">Settings</p>
              <p className="text-xs text-on-surface-variant">
                Personal, billing, and clinic controls
              </p>
            </div>
          </div>
        </div>

        <SearchInput
          className="mb-4"
          placeholder="Search settings"
          value={query}
          onSearch={setQuery}
        />

        <div className="space-y-5">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <p className="label-text px-2 text-outline mb-2">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;

                  const content = (
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors',
                        active
                          ? 'bg-secondary/10 text-secondary'
                          : item.disabled
                            ? 'text-outline'
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl',
                          active
                            ? 'bg-secondary/12 text-secondary'
                            : item.disabled
                              ? 'bg-surface-container text-outline'
                              : 'bg-surface-container-low text-on-surface-variant'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{item.label}</p>
                          {item.disabled ? (
                            <Badge variant="default" className="text-[10px]">
                              Soon
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          {item.description}
                        </p>
                      </div>
                      {!item.disabled ? (
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 shrink-0',
                            active ? 'text-secondary' : 'text-outline'
                          )}
                        />
                      ) : null}
                    </div>
                  );

                  if (item.disabled || !item.href) {
                    return (
                      <div key={item.label} aria-disabled="true">
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link key={item.label} href={item.href}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 rounded-[1.85rem] border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-ambient-sm sm:p-7">
        {children}
      </div>
    </div>
  );
}
