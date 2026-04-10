'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { CONSULTATION_STATUS_LABELS } from '@/lib/constants';
import type { Consultation, ConsultationStatus } from '@/lib/types';
import { Stethoscope, ArrowRight } from 'lucide-react';

const statusVariant: Record<ConsultationStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  scheduled: 'info',
  brief_ready: 'info',
  recording: 'error',
  transcribing: 'warning',
  generating: 'info',
  review_pending: 'warning',
  approved: 'success',
  closeout_pending: 'info',
  closed: 'success',
  exported: 'default',
};

interface RecentConsultationsProps {
  consultations: Consultation[];
}

export function RecentConsultations({ consultations }: RecentConsultationsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Consultations</CardTitle>
          <Link href="/consultations" className="text-sm text-secondary font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardHeader>
      {consultations.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No consultations yet"
          description="Start your first consultation to see it here."
        />
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <Link
              key={c.id}
              href={`/consultations/${c.id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">
                  {c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : 'Unknown Patient'}
                </p>
                <p className="text-xs text-on-surface-variant">{formatDateTime(c.created_at)}</p>
              </div>
              <Badge variant={statusVariant[c.status]}>
                {CONSULTATION_STATUS_LABELS[c.status]}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
