import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  CreditCard,
  Database,
  FileText,
  Lock,
  Mic,
  Plug,
  ShieldCheck,
  Sun,
  User,
  Users,
} from 'lucide-react';

export type SettingsCategoryId =
  | 'safety'
  | 'profile'
  | 'clinic'
  | 'voice'
  | 'templates'
  | 'integrations'
  | 'team'
  | 'notifications'
  | 'billing'
  | 'security'
  | 'data'
  | 'appearance';

export interface SettingsCategory {
  id: SettingsCategoryId;
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Used as the right-pane eyebrow above the title. */
  eyebrow: string;
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'profile',
    href: '/settings/profile',
    label: 'Profile',
    description: 'Your name, photo, signature',
    icon: User,
    eyebrow: 'You',
  },
  {
    id: 'clinic',
    href: '/settings/clinic',
    label: 'Clinic',
    description: 'Practice, locations, hours',
    icon: Building2,
    eyebrow: 'Clinic',
  },
  {
    id: 'safety',
    href: '/settings',
    label: 'AI safety',
    description: 'Guardrails, flags, sign-off rules',
    icon: ShieldCheck,
    eyebrow: 'Safety',
  },
  {
    id: 'voice',
    href: '/settings/voice',
    label: 'Voice & recording',
    description: 'Microphone, retention, language',
    icon: Mic,
    eyebrow: 'Workflow',
  },
  {
    id: 'templates',
    href: '/settings/templates',
    label: 'Templates',
    description: 'House style, structure, defaults',
    icon: FileText,
    eyebrow: 'Workflow',
  },
  {
    id: 'integrations',
    href: '/settings/integrations',
    label: 'EMR & integrations',
    description: 'Best Practice, Medical Director, calendar',
    icon: Plug,
    eyebrow: 'Workflow',
  },
  {
    id: 'team',
    href: '/settings/team',
    label: 'Team',
    description: 'Members, roles, invitations',
    icon: Users,
    eyebrow: 'Clinic',
  },
  {
    id: 'notifications',
    href: '/settings/notifications',
    label: 'Notifications',
    description: 'Email, push, daily digest',
    icon: Bell,
    eyebrow: 'You',
  },
  {
    id: 'billing',
    href: '/settings/billing',
    label: 'Billing & plans',
    description: 'Plan, invoices, payment method',
    icon: CreditCard,
    eyebrow: 'Clinic',
  },
  {
    id: 'security',
    href: '/settings/security',
    label: 'Security & access',
    description: '2FA, SSO, devices, sessions',
    icon: Lock,
    eyebrow: 'You',
  },
  {
    id: 'data',
    href: '/settings/data',
    label: 'Data & privacy',
    description: 'Export, retention, deletion',
    icon: Database,
    eyebrow: 'Privacy',
  },
  {
    id: 'appearance',
    href: '/settings/appearance',
    label: 'Appearance',
    description: 'Theme, density, typography',
    icon: Sun,
    eyebrow: 'You',
  },
];

/** Most-specific (longest href) match wins so /settings doesn't shadow /settings/profile. */
export function activeCategory(pathname: string): SettingsCategory {
  const candidates = SETTINGS_CATEGORIES.filter((c) =>
    c.href === '/settings' ? pathname === '/settings' : pathname === c.href || pathname.startsWith(`${c.href}/`),
  ).sort((a, b) => b.href.length - a.href.length);
  return candidates[0] ?? SETTINGS_CATEGORIES.find((c) => c.id === 'safety')!;
}
