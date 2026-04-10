'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { ConsultationStatusBadge } from './ConsultationStatusBadge';
import { formatDateTime, formatDurationLong } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Consultation } from '@/lib/types';
import { ArrowRight, Clock, Mic, Stethoscope } from 'lucide-react';

export function ConsultationCard({ consultation }: { consultation: Consultation }) {
  const c = consultation;
  const isRecording = c.status === 'recording';
  const isProcessing = c.status === 'transcribing' || c.status === 'generating';

  return (
    <Link
      href={`/consultations/${c.id}`}
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-2xl transition-all',
        isRecording
          ? 'bg-error/5 ring-2 ring-error/30 hover:ring-error/50 shadow-ambient'
          : isProcessing
            ? 'bg-warning/5 ring-1 ring-warning/20 hover:ring-warning/40 shadow-ambient-sm'
            : 'bg-surface-container-lowest shadow-ambient-sm hover:shadow-ambient'
      )}
    >
      {/* Recording pulse indicator */}
      {isRecording && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-error" />
        </span>
      )}

      {/* Avatar or recording icon */}
      {isRecording ? (
        <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
          <Mic className="w-6 h-6 text-error animate-pulse" />
        </div>
      ) : c.patient ? (
        <Avatar firstName={c.patient.first_name} lastName={c.patient.last_name} size="md" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-on-surface-variant" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-on-surface truncate">
            {c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : 'Unknown patient'}
          </p>
          {isRecording && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-error">Recording</span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant">
          {c.consultation_type}
          {c.reason_for_visit ? ` — ${c.reason_for_visit}` : ''}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(c.created_at)}
          </span>
          {c.duration_seconds ? (
            <span className="text-xs text-on-surface-variant">
              {formatDurationLong(c.duration_seconds)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <ConsultationStatusBadge status={c.status} />
        <ArrowRight className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
