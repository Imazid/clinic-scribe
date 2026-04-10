'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { createClient } from '@/lib/supabase/client';
import type { Consultation } from '@/lib/types';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Link2,
  Mic,
  Plus,
  User,
  Video,
} from 'lucide-react';

type ViewMode = 'day' | 'week';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am–8pm

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekDays(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getConsultationHour(c: Consultation): number {
  const date = new Date(c.scheduled_for || c.created_at);
  return date.getHours();
}

function getConsultationMinute(c: Consultation): number {
  const date = new Date(c.scheduled_for || c.created_at);
  return date.getMinutes();
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Telehealth: Video,
};

export default function CalendarPage() {
  const router = useRouter();
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const addToast = useUIStore((s) => s.addToast);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const load = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const supabase = createClient();

      // Get date range for the query
      let rangeStart: Date;
      let rangeEnd: Date;
      if (viewMode === 'week') {
        const days = getWeekDays(selectedDate);
        rangeStart = new Date(days[0]);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(days[6]);
        rangeEnd.setHours(23, 59, 59, 999);
      } else {
        rangeStart = new Date(selectedDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(selectedDate);
        rangeEnd.setHours(23, 59, 59, 999);
      }

      const { data, error } = await supabase
        .from('consultations')
        .select('*, patient:patients(*)')
        .eq('clinic_id', clinicId)
        .or(`scheduled_for.gte.${rangeStart.toISOString()},created_at.gte.${rangeStart.toISOString()}`)
        .or(`scheduled_for.lte.${rangeEnd.toISOString()},created_at.lte.${rangeEnd.toISOString()}`)
        .order('scheduled_for', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setConsultations((data || []) as Consultation[]);
    } catch (err) {
      console.error(err);
      addToast('Failed to load calendar', 'error');
    } finally {
      setLoading(false);
    }
  }, [clinicId, selectedDate, viewMode, addToast]);

  useEffect(() => { load(); }, [load]);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  function navigateDate(direction: number) {
    const next = new Date(selectedDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setDate(next.getDate() + direction);
    }
    setSelectedDate(next);
  }

  // Group consultations by date for week view
  function getConsultationsForDate(date: Date) {
    return consultations.filter((c) => {
      const cDate = new Date(c.scheduled_for || c.created_at);
      return isSameDay(cDate, date);
    });
  }

  const todayConsultations = getConsultationsForDate(selectedDate);
  const upcoming = todayConsultations.filter((c) => {
    const cDate = new Date(c.scheduled_for || c.created_at);
    return cDate >= new Date();
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow"
        title="Calendar"
        description="View upcoming consultations, prepare for visits, and manage your schedule."
        variant="feature"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="action"
              onClick={() => router.push('/integrations')}
            >
              <Link2 className="w-4 h-4" />
              Connect Calendar
            </Button>
            <Button
              size="action"
              onClick={() => router.push('/consultations/new')}
            >
              <Plus className="w-4 h-4" />
              New Session
            </Button>
          </div>
        }
      />

      {/* Calendar integration CTA */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Connect your practice calendar</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Sync with Best Practice, MedicalDirector, Google Calendar, or Outlook to auto-populate your schedule.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/integrations')}
            className="shrink-0"
          >
            Set up integration
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Navigation + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate(-1)}
            className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateDate(1)}
            className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </button>
          <h2 className="text-lg font-semibold text-on-surface ml-2">
            {viewMode === 'week'
              ? `${formatShortDate(weekDays[0])} — ${formatShortDate(weekDays[6])}`
              : formatDate(selectedDate)}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1">
          {(['day', 'week'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {mode === 'day' ? 'Day' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'day' ? (
        <DayView
          consultations={todayConsultations}
          selectedDate={selectedDate}
          onNavigate={(id) => router.push(`/consultations/${id}/review`)}
        />
      ) : (
        <WeekView
          weekDays={weekDays}
          consultations={consultations}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          getConsultationsForDate={getConsultationsForDate}
          onNavigate={(id) => router.push(`/consultations/${id}/review`)}
        />
      )}

      {/* Quick actions */}
      {!loading && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-on-surface">Quick actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card
              className="hover:shadow-ambient-sm transition-shadow cursor-pointer group"
              onClick={() => router.push('/consultations/new')}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    Start walk-in session
                  </p>
                  <p className="text-xs text-on-surface-variant">Record a consultation now</p>
                </div>
              </div>
            </Card>
            <Card
              className="hover:shadow-ambient-sm transition-shadow cursor-pointer group"
              onClick={() => router.push('/prepare')}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                    Prepare for next visit
                  </p>
                  <p className="text-xs text-on-surface-variant">Generate visit briefs</p>
                </div>
              </div>
            </Card>
            <Card
              className="hover:shadow-ambient-sm transition-shadow cursor-pointer group"
              onClick={() => router.push('/integrations')}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface group-hover:text-warning transition-colors">
                    Connect practice software
                  </p>
                  <p className="text-xs text-on-surface-variant">Sync with Best Practice, etc.</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Day View                                                          */
/* ------------------------------------------------------------------ */

function DayView({
  consultations,
  selectedDate,
  onNavigate,
}: {
  consultations: Consultation[];
  selectedDate: Date;
  onNavigate: (id: string) => void;
}) {
  if (consultations.length === 0) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="No consultations scheduled"
        description={`No sessions for ${formatDate(selectedDate)}. Create a new session or connect your practice calendar.`}
      />
    );
  }

  return (
    <div className="relative">
      {/* Time grid */}
      <div className="space-y-0">
        {HOURS.map((hour) => {
          const hourConsultations = consultations.filter(
            (c) => getConsultationHour(c) === hour
          );

          return (
            <div key={hour} className="flex min-h-[64px] border-t border-outline-variant/15">
              {/* Time label */}
              <div className="w-16 shrink-0 pt-2 pr-3 text-right">
                <span className="text-xs text-on-surface-variant font-medium">
                  {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </span>
              </div>

              {/* Consultation slots */}
              <div className="flex-1 py-1 space-y-1">
                {hourConsultations.map((c, i) => (
                  <ConsultationSlot key={c.id} consultation={c} index={i} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Week View                                                         */
/* ------------------------------------------------------------------ */

function WeekView({
  weekDays,
  selectedDate,
  onSelectDate,
  getConsultationsForDate,
  onNavigate,
}: {
  weekDays: Date[];
  consultations: Consultation[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getConsultationsForDate: (date: Date) => Consultation[];
  onNavigate: (id: string) => void;
}) {
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const dayConsultations = getConsultationsForDate(day);
        const isToday = isSameDay(day, today);
        const isSelected = isSameDay(day, selectedDate);

        return (
          <div
            key={day.toISOString()}
            className={`rounded-xl border transition-colors cursor-pointer min-h-[200px] ${
              isSelected
                ? 'border-secondary bg-secondary/3'
                : isToday
                  ? 'border-primary/30 bg-primary/3'
                  : 'border-outline-variant/20 hover:border-outline-variant/40'
            }`}
            onClick={() => onSelectDate(day)}
          >
            {/* Day header */}
            <div className="px-3 py-2 border-b border-outline-variant/15">
              <p className={`text-xs font-medium ${
                isToday ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                {day.toLocaleDateString('en-AU', { weekday: 'short' })}
              </p>
              <p className={`text-lg font-bold ${
                isToday ? 'text-primary' : isSelected ? 'text-secondary' : 'text-on-surface'
              }`}>
                {day.getDate()}
              </p>
            </div>

            {/* Consultation dots */}
            <div className="p-2 space-y-1">
              {dayConsultations.slice(0, 4).map((c) => {
                const time = new Date(c.scheduled_for || c.created_at);
                return (
                  <div
                    key={c.id}
                    onClick={(e) => { e.stopPropagation(); onNavigate(c.id); }}
                    className="rounded-lg bg-secondary/8 px-2 py-1 text-[10px] font-medium text-secondary truncate hover:bg-secondary/15 transition-colors"
                  >
                    {time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                    {' '}
                    {c.patient ? `${c.patient.first_name}` : 'Patient'}
                  </div>
                );
              })}
              {dayConsultations.length > 4 && (
                <p className="text-[10px] text-on-surface-variant text-center">
                  +{dayConsultations.length - 4} more
                </p>
              )}
              {dayConsultations.length === 0 && (
                <p className="text-[10px] text-on-surface-variant/50 text-center pt-2">
                  No sessions
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Consultation Slot (used in day view)                              */
/* ------------------------------------------------------------------ */

function ConsultationSlot({
  consultation,
  index,
  onNavigate,
}: {
  consultation: Consultation;
  index: number;
  onNavigate: (id: string) => void;
}) {
  const time = new Date(consultation.scheduled_for || consultation.created_at);
  const patientName = consultation.patient
    ? `${consultation.patient.first_name} ${consultation.patient.last_name}`
    : 'Unknown patient';
  const TypeIcon = TYPE_ICONS[consultation.consultation_type] || User;
  const isPast = time < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => onNavigate(consultation.id)}
      className={`rounded-xl px-4 py-3 cursor-pointer transition-all group ${
        isPast
          ? 'bg-surface-container-low/60 hover:bg-surface-container-low'
          : 'bg-secondary/5 hover:bg-secondary/10 ring-1 ring-secondary/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isPast ? 'bg-surface-container' : 'bg-secondary/10'
          }`}>
            <TypeIcon className={`w-4 h-4 ${isPast ? 'text-on-surface-variant' : 'text-secondary'}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${isPast ? 'text-on-surface-variant' : 'text-on-surface'}`}>
              {patientName}
            </p>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
              <Clock className="w-3 h-3" />
              <span>
                {time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>{consultation.consultation_type}</span>
              {consultation.reason_for_visit && (
                <span className="truncate max-w-[200px]">
                  — {consultation.reason_for_visit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={isPast ? 'default' : 'info'}>
            {isPast ? consultation.status : 'Upcoming'}
          </Badge>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}
