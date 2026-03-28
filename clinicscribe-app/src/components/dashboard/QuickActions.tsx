'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mic, UserPlus, FileText, BarChart3 } from 'lucide-react';

const actions = [
  { label: 'New Consultation', icon: Mic, href: '/consultations/new', color: 'bg-secondary/10 text-secondary' },
  { label: 'Add Patient', icon: UserPlus, href: '/patients/new', color: 'bg-success/10 text-success' },
  { label: 'Review Notes', icon: FileText, href: '/consultations?status=review_pending', color: 'bg-warning/10 text-warning' },
  { label: 'View Analytics', icon: BarChart3, href: '/analytics', color: 'bg-primary/10 text-primary' },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
