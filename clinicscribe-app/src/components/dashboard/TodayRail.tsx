'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Video } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Consultation } from '@/lib/types';

interface TodayRailProps {
  consultations: Consultation[];
  /** id of the consultation considered "next up" — gets the slate-blue highlight. */
  nextId?: string | null;
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.round(seconds / 60);
  return `${mins}m`;
}

function modeFromConsultation(c: Consultation): { label: string; icon: typeof Video } {
  // Heuristic based on `source` or consultation_type until we have a dedicated field.
  const t = (c.consultation_type || '').toLowerCase();
  if (t.includes('telehealth') || c.source?.toLowerCase() === 'telehealth') {
    return { label: 'Telehealth', icon: Video };
  }
  return { label: 'In-clinic', icon: Building2 };
}

function PrepBadge({ status }: { status: Consultation['status'] }) {
  if (status === 'brief_ready') return <Badge variant="success">Prepped</Badge>;
  if (status === 'scheduled') return <Badge variant="warning">Brief needed</Badge>;
  if (status === 'recording') return <Badge variant="info">In progress</Badge>;
  if (status === 'review_pending') return <Badge variant="warning">Awaiting review</Badge>;
  if (status === 'closeout_pending') return <Badge variant="info">Closeout</Badge>;
  if (status === 'approved' || status === 'closed' || status === 'exported') return <Badge variant="default">Done</Badge>;
  if (status === 'transcribing' || status === 'generating') return <Badge variant="info">Processing</Badge>;
  return null;
}

/**
 * TodayRail — vertical list of today's consultations, with the active "Next"
 * one highlighted in the soft slate-blue fill. Replaces the older
 * RecentConsultations table.
 */
export function TodayRail({ consultations, nextId }: TodayRailProps) {
  return (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <div className="eyebrow mb-1">Schedule</div>
          <div className="text-[17px] font-bold tracking-[-0.01em] text-on-surface">
            Today&apos;s consultations
          </div>
        </div>
        <Badge variant="info">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
          {consultations.length} booked
        </Badge>
      </div>
      <div className="divider-h" />
      {consultations.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-on-surface-variant">
          No consultations on the calendar today.
        </div>
      ) : (
        <div>
          {consultations.map((c, i) => {
            const isNext = c.id === nextId;
            const mode = modeFromConsultation(c);
            const ModeIcon = mode.icon;
            const time = formatTime(c.scheduled_for ?? c.started_at);
            const duration = formatDuration(c.duration_seconds);
            const patientName = c.patient
              ? `${c.patient.first_name} ${c.patient.last_name}`
              : 'Patient';
            return (
              <Link
                key={c.id}
                href={`/consultations/${c.id}`}
                className={cn(
                  'grid grid-cols-[52px_1fr_auto] items-center gap-3 px-5 py-3.5 transition-colors',
                  i < consultations.length - 1 && 'border-b border-outline-variant/60',
                  isNext ? 'bg-secondary-fixed' : 'hover:bg-surface-container-low',
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className={cn(
                      'text-sm font-bold tracking-tight',
                      isNext ? 'text-secondary' : 'text-on-surface',
                    )}
                  >
                    {time}
                  </div>
                  <div className="text-[10px] text-outline">{duration}</div>
                </div>
                <div className="min-w-0">
                  <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                    <div className="text-[13px] font-semibold text-on-surface">
                      {patientName}
                    </div>
                    {isNext && <Badge variant="info" className="text-[10px]">Next</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="truncate">{c.consultation_type}</span>
                    <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-outline-variant" />
                    <span className="inline-flex items-center gap-1">
                      <ModeIcon className="h-3 w-3" />
                      {mode.label}
                    </span>
                  </div>
                </div>
                <PrepBadge status={c.status} />
              </Link>
            );
          })}
        </div>
      )}
      <div className="border-t border-outline-variant/60 p-3">
        <Link
          href="/consultations"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          View full schedule <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
