'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { ConsultationStatusBadge } from './ConsultationStatusBadge';
import { formatDateTime, formatDurationLong } from '@/lib/utils';
import type { Consultation } from '@/lib/types';
import { Clock } from 'lucide-react';

export function ConsultationCard({ consultation }: { consultation: Consultation }) {
  const c = consultation;
  return (
    <Link
      href={`/consultations/${c.id}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-ambient-sm hover:shadow-ambient transition-shadow"
    >
      {c.patient && (
        <Avatar firstName={c.patient.first_name} lastName={c.patient.last_name} size="md" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">
          {c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : 'Unknown'}
        </p>
        <p className="text-xs text-on-surface-variant">
          {c.consultation_type} &middot; {formatDateTime(c.created_at)}
        </p>
        {c.duration_seconds && (
          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {formatDurationLong(c.duration_seconds)}
          </p>
        )}
      </div>
      <ConsultationStatusBadge status={c.status} />
    </Link>
  );
}
