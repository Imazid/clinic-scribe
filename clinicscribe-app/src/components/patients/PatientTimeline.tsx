'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { CONSULTATION_STATUS_LABELS } from '@/lib/constants';
import type { Consultation, ConsultationStatus, TimelineEvent } from '@/lib/types';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Filter,
  FlaskConical,
  Pill,
  Send,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

type EventCategory = 'consultation' | 'problem' | 'medication' | 'result' | 'referral' | 'task';

const EVENT_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; category: EventCategory }> = {
  consultation: { icon: FileText, color: 'text-secondary bg-secondary/10', category: 'consultation' },
  problem_added: { icon: Stethoscope, color: 'text-primary bg-primary/10', category: 'problem' },
  problem_resolved: { icon: CheckCircle, color: 'text-success bg-success/10', category: 'problem' },
  medication_started: { icon: Pill, color: 'text-warning bg-warning/10', category: 'medication' },
  medication_changed: { icon: Pill, color: 'text-warning bg-warning/10', category: 'medication' },
  medication_stopped: { icon: Pill, color: 'text-on-surface-variant bg-surface-container-high', category: 'medication' },
  lab_result: { icon: FlaskConical, color: 'text-info bg-info/10', category: 'result' },
  referral: { icon: Send, color: 'text-primary bg-primary/10', category: 'referral' },
  task_completed: { icon: CheckCircle, color: 'text-success bg-success/10', category: 'task' },
};

const FILTER_OPTIONS: { id: EventCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All', icon: Filter },
  { id: 'consultation', label: 'Visits', icon: FileText },
  { id: 'problem', label: 'Problems', icon: Stethoscope },
  { id: 'medication', label: 'Medications', icon: Pill },
  { id: 'result', label: 'Results', icon: FlaskConical },
  { id: 'referral', label: 'Referrals', icon: Send },
];

function getEventConfig(eventType: string) {
  return EVENT_CONFIG[eventType] ?? EVENT_CONFIG.consultation;
}

/* Individual timeline entry with expand/collapse */
function TimelineEntry({
  event,
  isLast,
}: {
  event: TimelineEvent & { consultation?: Consultation };
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = getEventConfig(event.event_type);
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4">
      {/* Vertical connector */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-outline-variant/40" />
      )}

      {/* Icon node */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10',
        config.color
      )}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-on-surface">{event.title}</p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateTime(event.event_date)}
              </span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant" /> : <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />}
            </div>
          </div>
          <p className="text-sm text-on-surface-variant line-clamp-2">{event.summary}</p>
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-2 px-3 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
            <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{event.summary}</p>
            {event.consultation_id && (
              <Link
                href={`/consultations/${event.consultation_id}`}
                className="mt-2 inline-flex items-center gap-1 text-xs text-secondary font-medium hover:underline"
              >
                <FileText className="w-3 h-3" /> View consultation
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Consultation entry (shown when no timeline events, or mixed in) */
function ConsultationTimelineEntry({
  consultation,
  isLast,
}: {
  consultation: Consultation;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-outline-variant/40" />
      )}

      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 z-10">
        <FileText className="w-5 h-5 text-secondary" />
      </div>

      <div className="flex-1 pb-4">
        <Link
          href={`/consultations/${consultation.id}`}
          className="block p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-on-surface">
              {consultation.consultation_type || 'Consultation'}
            </p>
            <Badge variant={statusVariant[consultation.status]}>
              {CONSULTATION_STATUS_LABELS[consultation.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(consultation.created_at)}
            </span>
            {consultation.clinician && <span>Dr. {consultation.clinician.last_name}</span>}
            {consultation.reason_for_visit && (
              <span className="text-on-surface-variant/70">· {consultation.reason_for_visit}</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

interface PatientTimelineProps {
  consultations: Consultation[];
  timelineEvents?: TimelineEvent[];
}

export function PatientTimeline({ consultations, timelineEvents = [] }: PatientTimelineProps) {
  const [filter, setFilter] = useState<EventCategory | 'all'>('all');

  // Merge consultations and timeline events into a unified list sorted by date
  const mergedEntries = useMemo(() => {
    type Entry = { type: 'consultation'; data: Consultation; date: string } | { type: 'event'; data: TimelineEvent; date: string };
    const entries: Entry[] = [];

    consultations.forEach((c) => {
      entries.push({ type: 'consultation', data: c, date: c.created_at });
    });

    timelineEvents.forEach((e) => {
      entries.push({ type: 'event', data: e, date: e.event_date });
    });

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return entries;
  }, [consultations, timelineEvents]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return mergedEntries;
    return mergedEntries.filter((entry) => {
      if (entry.type === 'consultation') return filter === 'consultation';
      const config = getEventConfig(entry.data.event_type);
      return config.category === filter;
    });
  }, [mergedEntries, filter]);

  if (consultations.length === 0 && timelineEvents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-on-surface-variant">
        No consultations or events recorded yet.
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-1 mb-4">
        {FILTER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const count = opt.id === 'all'
            ? mergedEntries.length
            : mergedEntries.filter((e) => {
                if (e.type === 'consultation') return opt.id === 'consultation';
                return getEventConfig(e.data.event_type).category === opt.id;
              }).length;
          if (count === 0 && opt.id !== 'all') return null;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filter === opt.id
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Timeline entries */}
      <div>
        {filteredEntries.map((entry, i) => {
          const isLast = i === filteredEntries.length - 1;
          if (entry.type === 'consultation') {
            return <ConsultationTimelineEntry key={`c-${entry.data.id}`} consultation={entry.data} isLast={isLast} />;
          }
          return <TimelineEntry key={`e-${entry.data.id}`} event={entry.data} isLast={isLast} />;
        })}
      </div>
    </div>
  );
}
