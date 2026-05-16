'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Loader2,
  Mic,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { HeroStrip, HeroAccent } from '@/components/ui/HeroStrip';
import { ConsultationCard } from '@/components/consultations/ConsultationCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchInput } from '@/components/ui/SearchInput';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getConsultations } from '@/lib/api/consultations';
import type { Consultation, ConsultationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type FilterId = 'all' | 'today' | 'recording' | 'processing' | 'queued' | 'completed';

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'recording', label: 'Recording' },
  { id: 'processing', label: 'Processing' },
  { id: 'queued', label: 'Queued' },
  { id: 'completed', label: 'Completed' },
];

const RECORDING_STATUSES: ConsultationStatus[] = ['recording'];
const PROCESSING_STATUSES: ConsultationStatus[] = ['transcribing', 'generating'];
const QUEUED_STATUSES: ConsultationStatus[] = ['scheduled', 'brief_ready'];
const COMPLETED_STATUSES: ConsultationStatus[] = [
  'review_pending',
  'approved',
  'closeout_pending',
  'closed',
  'exported',
];

function isToday(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function isThisWeek(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d.getTime() >= startOfWeek.getTime();
}

function matchesFilter(c: Consultation, filter: FilterId): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'today':
      return isToday(c.scheduled_for ?? c.started_at ?? c.created_at);
    case 'recording':
      return RECORDING_STATUSES.includes(c.status);
    case 'processing':
      return PROCESSING_STATUSES.includes(c.status);
    case 'queued':
      return QUEUED_STATUSES.includes(c.status);
    case 'completed':
      return COMPLETED_STATUSES.includes(c.status);
  }
}

export default function CapturePage() {
  const router = useRouter();
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

  useEffect(() => {
    async function load() {
      if (!clinicId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getConsultations(clinicId);
        setConsultations(data);
      } catch (error) {
        console.error('[capture-load]', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clinicId]);

  const stats = useMemo(() => {
    const today = consultations.filter((c) =>
      isToday(c.scheduled_for ?? c.started_at ?? c.created_at),
    );
    const recordingCount = consultations.filter((c) => RECORDING_STATUSES.includes(c.status)).length;
    const processingCount = consultations.filter((c) => PROCESSING_STATUSES.includes(c.status)).length;
    const completedThisWeek = consultations.filter(
      (c) =>
        COMPLETED_STATUSES.includes(c.status) &&
        isThisWeek(c.updated_at ?? c.created_at),
    ).length;

    return [
      {
        label: "Today's queue",
        value: today.length,
        sub: `${today.filter((c) => QUEUED_STATUSES.includes(c.status)).length} unstarted`,
        icon: CalendarCheck,
        tone: 'default' as const,
      },
      {
        label: 'Recording now',
        value: recordingCount,
        sub: recordingCount === 0 ? 'Idle' : 'Live',
        icon: Radio,
        tone: recordingCount > 0 ? ('error' as const) : ('default' as const),
      },
      {
        label: 'Processing',
        value: processingCount,
        sub: processingCount === 0 ? '—' : 'In flight',
        icon: Loader2,
        tone: processingCount > 0 ? ('warning' as const) : ('default' as const),
      },
      {
        label: 'Finalised',
        value: completedThisWeek,
        sub: 'this week',
        icon: ShieldCheck,
        tone: 'success' as const,
      },
    ];
  }, [consultations]);

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return consultations.filter((c) => {
      if (!matchesFilter(c, filter)) return false;
      if (!lower) return true;
      const name = c.patient
        ? `${c.patient.first_name} ${c.patient.last_name}`.toLowerCase()
        : '';
      const type = (c.consultation_type ?? '').toLowerCase();
      return name.includes(lower) || type.includes(lower);
    });
  }, [consultations, search, filter]);

  const filterCounts = useMemo<Record<FilterId, number>>(() => {
    return {
      all: consultations.length,
      today: consultations.filter((c) =>
        isToday(c.scheduled_for ?? c.started_at ?? c.created_at),
      ).length,
      recording: consultations.filter((c) => RECORDING_STATUSES.includes(c.status)).length,
      processing: consultations.filter((c) => PROCESSING_STATUSES.includes(c.status)).length,
      queued: consultations.filter((c) => QUEUED_STATUSES.includes(c.status)).length,
      completed: consultations.filter((c) => COMPLETED_STATUSES.includes(c.status)).length,
    };
  }, [consultations]);

  return (
    <div className="space-y-8">
      <HeroStrip
        eyebrow="Capture"
        title={
          <>
            Pick up a session, or <HeroAccent>start fresh</HeroAccent>.
          </>
        }
        description="Live consultations, in-flight processing, and queued sessions — all in one place."
        stats={stats}
        actions={
          <Link
            href="/consultations/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/70 bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-ambient-sm transition-all hover:-translate-y-px hover:bg-primary-container hover:shadow-ambient"
          >
            <Mic className="h-4 w-4" /> New session
          </Link>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const isActive = filter === f.id;
              const count = filterCounts[f.id];
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition-colors',
                    isActive
                      ? 'border-transparent bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-secondary/30 hover:text-secondary',
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive
                        ? 'bg-on-primary/15 text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <SearchInput
            placeholder="Search by patient or type…"
            value={search}
            onSearch={setSearch}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:w-72"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-ambient-sm"
              >
                <Skeleton variant="circular" className="h-12 w-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Mic}
            title={
              filter === 'all' && !search
                ? 'No consultations yet'
                : 'Nothing matches that filter'
            }
            description={
              filter === 'all' && !search
                ? 'Start a new session to begin capturing a consultation.'
                : 'Try a different filter or clear the search.'
            }
            actionLabel={filter === 'all' && !search ? 'New session' : undefined}
            onAction={
              filter === 'all' && !search
                ? () => router.push('/consultations/new')
                : undefined
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((consultation) => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))}
            <p className="pt-2 text-right text-xs text-outline">
              <span className="font-semibold">{filtered.length}</span> of{' '}
              {consultations.length} session{consultations.length === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
