'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { User, Building, Bell, Shield, Palette, CreditCard } from 'lucide-react';

const settingsSections = [
  { title: 'Profile', description: 'Update your personal information and credentials', icon: User, href: '/settings/profile' },
  { title: 'Subscription & Billing', description: 'Manage your plan, seats, and payment method', icon: CreditCard, href: '/settings/billing' },
  { title: 'Clinic', description: 'Manage your clinic details and preferences', icon: Building, href: '/settings' },
  { title: 'Notifications', description: 'Configure notification preferences', icon: Bell, href: '/settings' },
  { title: 'Security', description: 'Password, two-factor authentication, sessions', icon: Shield, href: '/settings' },
  { title: 'Appearance', description: 'Customize the look and feel', icon: Palette, href: '/settings' },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and clinic preferences." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((section) => (
          <Link key={section.title} href={section.href}>
            <Card className="hover:shadow-ambient transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">{section.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-1">{section.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
