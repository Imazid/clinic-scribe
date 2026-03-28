'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { CONSULTATION_STATUS_LABELS } from '@/lib/constants';
import type { Consultation, ConsultationStatus } from '@/lib/types';
import { FileText, Clock } from 'lucide-react';

const statusVariant: Record<ConsultationStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  recording: 'error',
  transcribing: 'warning',
  generating: 'info',
  review_pending: 'warning',
  approved: 'success',
  exported: 'default',
};

interface PatientTimelineProps {
  consultations: Consultation[];
}

export function PatientTimeline({ consultations }: PatientTimelineProps) {
  if (consultations.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-on-surface-variant">
        No consultations recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {consultations.map((c, i) => (
        <div key={c.id} className="relative flex gap-4">
          {i < consultations.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-px bg-outline-variant/50" />
          )}
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0 z-10">
            <FileText className="w-5 h-5 text-on-surface-variant" />
          </div>
          <Link
            href={`/consultations/${c.id}`}
            className="flex-1 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-on-surface">{c.consultation_type || 'Consultation'}</p>
              <Badge variant={statusVariant[c.status]}>
                {CONSULTATION_STATUS_LABELS[c.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateTime(c.created_at)}
              </span>
              {c.clinician && <span>Dr. {c.clinician.last_name}</span>}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
