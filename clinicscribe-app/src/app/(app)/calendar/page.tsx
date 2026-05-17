'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { createClient } from '@/lib/supabase/client';
import type { Consultation } from '@/lib/types';
import { ScheduleAppointmentDialog } from '@/components/calendar/ScheduleAppointmentDialog';
import {
  AlertTriangle,
  Building2,
  Calendar as CalendarIcon,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ChevronRight as RightChevron,
  Link2,
  Mic,
  MessageSquare,
  Video,
} from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am–6pm
const HOUR_HEIGHT_PX = 80;

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function getMondayWeek(base: Date): Date[] {
  const monday = startOfDay(base);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
function formatRangeLabel(days: Date[]): string {
  const first = days[0];
  const last = days[6];
  const sameMonth = first.getMonth() === last.getMonth();
  const day1 = first.getDate();
  const day2 = last.getDate();
  const month = last.toLocaleDateString('en-AU', { month: 'short' });
  return sameMonth
    ? `Week of ${day1}–${day2} ${month}`
    : `Week of ${day1} ${first.toLocaleDateString('en-AU', { month: 'short' })} – ${day2} ${month}`;
}
function consultDate(c: Consultation): Date {
  return new Date(c.scheduled_for || c.created_at);
}
function consultDuration(c: Consultation): number {
  if (c.duration_seconds && c.duration_seconds > 0) return Math.round(c.duration_seconds / 60);
  return 30; // sensible default for upcoming slots
}
function isTelehealth(c: Consultation): boolean {
  return (c.consultation_type || '').toLowerCase().includes('telehealth');
}
function isPrepReady(c: Consultation): boolean {
  return Boolean(c.visit_brief && c.visit_brief.status === 'ready');
}
function isPrepNeeded(c: Consultation): boolean {
  return !c.visit_brief || c.visit_brief.status === 'draft';
}

export default function CalendarPage() {
  const router = useRouter();
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const addToast = useUIStore((s) => s.addToast);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>('day');
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const weekDays = useMemo(() => getMondayWeek(selectedDate), [selectedDate]);

  const load = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      // Always pull the full visible week so the day strip counts are real.
      const rangeStart = startOfDay(weekDays[0]).toISOString();
      const rangeEnd = endOfDay(weekDays[6]).toISOString();
      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultations')
        .select('*, patient:patients(*), visit_brief:visit_briefs(*)')
        .eq('clinic_id', clinicId)
        .or(`scheduled_for.gte.${rangeStart},and(scheduled_for.is.null,created_at.gte.${rangeStart})`)
        .or(`scheduled_for.lte.${rangeEnd},and(scheduled_for.is.null,created_at.lte.${rangeEnd})`)
        .order('scheduled_for', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      const rows = (data || []).map((c) => {
        const raw = c as Record<string, unknown>;
        if (Array.isArray(raw.visit_brief)) raw.visit_brief = raw.visit_brief[0] ?? null;
        return raw as unknown as Consultation;
      });
      setConsultations(rows);
    } catch (err) {
      console.error('[calendar-load]', err);
      addToast('Failed to load calendar', 'error');
    } finally {
      setLoading(false);
    }
  }, [clinicId, weekDays, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const dayConsultations = useMemo(
    () =>
      consultations
        .filter((c) => isSameDay(consultDate(c), selectedDate))
        .sort((a, b) => consultDate(a).getTime() - consultDate(b).getTime()),
    [consultations, selectedDate],
  );

  const now = useMemo(() => new Date(), [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextUpId = useMemo(() => {
    const upcoming = dayConsultations
      .filter((c) => consultDate(c) >= now)
      .sort((a, b) => consultDate(a).getTime() - consultDate(b).getTime())[0];
    return upcoming?.id ?? null;
  }, [dayConsultations, now]);

  const selectedAppt =
    dayConsultations.find((c) => c.id === selectedApptId) ?? dayConsultations.find((c) => c.id === nextUpId) ?? dayConsultations[0] ?? null;

  const weekStats = useMemo(() => {
    const total = consultations.length;
    const telehealth = consultations.filter(isTelehealth).length;
    const inClinic = total - telehealth;
    const needsPrep = consultations.filter(isPrepNeeded).length;
    return { total, telehealth, inClinic, needsPrep };
  }, [consultations]);

  function navigateDate(direction: number) {
    const next = new Date(selectedDate);
    if (view === 'week' || view === 'month') {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setDate(next.getDate() + direction);
    }
    setSelectedDate(next);
  }

  function countForDate(d: Date): number {
    return consultations.filter((c) => isSameDay(consultDate(c), d)).length;
  }

  // ── future appointments for the selected patient (next 3 after today) ──
  const futureAppointments = useMemo(() => {
    if (!selectedAppt?.patient_id) return [];
    const today = startOfDay(new Date()).getTime();
    return consultations
      .filter(
        (c) =>
          c.patient_id === selectedAppt.patient_id &&
          c.id !== selectedAppt.id &&
          consultDate(c).getTime() > today,
      )
      .sort((a, b) => consultDate(a).getTime() - consultDate(b).getTime())
      .slice(0, 3);
  }, [consultations, selectedAppt]);

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Hero strip */}
      <div className="mesh-bg relative overflow-hidden rounded-3xl border border-outline-variant/60 bg-gradient-to-br from-surface-container-lowest to-surface-container-low px-7 py-6">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="eyebrow">{formatRangeLabel(weekDays)}</p>
            <h1 className="mt-1.5 font-display text-[28px] font-semibold leading-tight tracking-[-0.02em]">
              <span className="italic text-secondary">{weekStats.total}</span>{' '}
              {weekStats.total === 1 ? 'appointment' : 'appointments'} this week
            </h1>
            <p className="mt-1 text-[13px] text-on-surface-variant">
              {weekStats.telehealth} telehealth · {weekStats.inClinic} in-clinic
              {weekStats.needsPrep > 0 && ` · ${weekStats.needsPrep} need pre-consult prep`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-1">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => v !== 'month' ? setView(v) : addToast('Month view ships next.', 'info')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors',
                    view === v
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button variant="outline" size="action" onClick={() => router.push('/integrations')}>
              <Link2 className="h-4 w-4" />
              Sync calendar
            </Button>
            <Button size="action" onClick={() => setDialogOpen(true)}>
              <CalendarPlus className="h-4 w-4" />
              New appointment
            </Button>
          </div>
        </div>
      </div>

      {/* 7-day strip */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigateDate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="grid flex-1 grid-cols-7 gap-2">
          {weekDays.map((d, i) => {
            const isToday = isSameDay(d, new Date());
            const isSelected = isSameDay(d, selectedDate);
            const count = countForDate(d);
            return (
              <button
                key={d.toISOString()}
                onClick={() => {
                  setSelectedDate(d);
                  setSelectedApptId(null);
                }}
                className={cn(
                  'rounded-2xl px-3 py-3.5 text-center transition-colors',
                  isToday
                    ? 'bg-primary text-on-primary shadow-ambient-lg'
                    : isSelected
                      ? 'border-[1.5px] border-secondary bg-secondary-fixed text-secondary'
                      : 'border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-secondary/40',
                )}
              >
                <p
                  className={cn(
                    'text-[11px] font-bold uppercase tracking-[0.06em]',
                    isToday ? 'text-on-primary/70' : 'text-on-surface-variant/85',
                  )}
                >
                  {WEEKDAY_LABELS[i]}
                </p>
                <p className="mt-1 font-display text-[24px] font-bold leading-none tracking-[-0.02em]">
                  {d.getDate()}
                </p>
                <p
                  className={cn(
                    'mt-1.5 text-[11px]',
                    isToday ? 'text-on-primary/70' : 'text-outline',
                  )}
                >
                  {count > 0 ? `${count} consult${count === 1 ? '' : 's'}` : 'Day off'}
                </p>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day pane: timeline + detail */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Timeline */}
        <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-ambient-sm">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant/60 px-6 py-4">
            <div>
              <p className="eyebrow">{selectedDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p className="mt-1 text-[15px] font-bold text-on-surface">
                {dayConsultations.length}{' '}
                {dayConsultations.length === 1 ? 'consult' : 'consults'}
                {dayConsultations.length > 0 && (
                  <span className="ml-2 text-[12px] font-medium text-on-surface-variant">
                    · {totalBookedLabel(dayConsultations)} booked
                  </span>
                )}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : dayConsultations.length === 0 ? (
            <EmptyDay
              dateLabel={selectedDate.toLocaleDateString('en-AU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              onSchedule={() => setDialogOpen(true)}
            />
          ) : (
            <div className="flex">
              {/* Hour rail */}
              <div className="w-[70px] shrink-0 border-r border-outline-variant/60">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="px-3 py-1 text-right font-mono text-[11px] text-outline"
                    style={{ height: HOUR_HEIGHT_PX }}
                  >
                    {(h % 12 || 12) + ':00 ' + (h < 12 ? 'AM' : 'PM')}
                  </div>
                ))}
              </div>
              {/* Appointment blocks */}
              <div className="flex-1 px-5 py-2">
                <div className="flex flex-col gap-2">
                  {dayConsultations.map((c, idx) => {
                    const isSel = c.id === (selectedAppt?.id ?? '');
                    const isPast = consultDate(c) < now && c.id !== nextUpId;
                    const isNext = c.id === nextUpId;
                    const needsPrep = isPrepNeeded(c);
                    const ringColor = isPast
                      ? 'var(--color-outline-variant)'
                      : isNext
                        ? 'var(--color-secondary)'
                        : needsPrep
                          ? 'var(--color-warning)'
                          : 'var(--color-tertiary)';

                    return (
                      <motion.button
                        key={c.id}
                        type="button"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.18 }}
                        onClick={() => setSelectedApptId(c.id)}
                        className={cn(
                          'flex w-full items-center gap-3.5 rounded-xl border-[1.5px] px-4 py-3 text-left transition-colors',
                          isSel
                            ? 'border-secondary bg-secondary-fixed'
                            : isPast
                              ? 'border-outline-variant bg-surface-container-low opacity-70'
                              : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40',
                        )}
                        style={{ borderLeft: `4px solid ${ringColor}` }}
                      >
                        <div className="w-[60px] shrink-0">
                          <p className="font-mono text-[14px] font-bold text-on-surface">
                            {consultDate(c).toLocaleTimeString('en-AU', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-[10px] text-outline">{consultDuration(c)} min</p>
                        </div>
                        <Avatar
                          firstName={c.patient?.first_name ?? '?'}
                          lastName={c.patient?.last_name ?? ''}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[14px] font-bold text-on-surface">
                              {c.patient
                                ? `${c.patient.first_name} ${c.patient.last_name}`
                                : 'Unknown patient'}
                            </span>
                            {isNext && <Badge variant="info">Next</Badge>}
                            {isPast && <Badge variant="default">Completed</Badge>}
                          </div>
                          <p className="mt-0.5 truncate text-[12px] text-on-surface-variant">
                            {c.reason_for_visit || c.consultation_type} ·{' '}
                            {isTelehealth(c) ? 'Telehealth' : 'In-clinic'}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {isPrepReady(c) && !isPast && <Badge variant="success">Prepped</Badge>}
                          {needsPrep && !isPast && <Badge variant="warning">Brief needed</Badge>}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Detail panel */}
        <div className="flex flex-col gap-4">
          <DetailCard
            appointment={selectedAppt}
            onStart={(id) => router.push(`/consultations/${id}/review`)}
            onSchedule={() => setDialogOpen(true)}
          />
          <FutureBookingsCard
            futureAppointments={futureAppointments}
            onPick={(id) => setSelectedApptId(id)}
            onSchedule={() => setDialogOpen(true)}
          />
        </div>
      </div>

      <ScheduleAppointmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        defaultDate={selectedDate}
        defaultPatient={selectedAppt?.patient ?? null}
        onCreated={async () => {
          await load();
        }}
      />
    </div>
  );
}

function totalBookedLabel(rows: Consultation[]): string {
  const totalMinutes = rows.reduce((acc, c) => acc + consultDuration(c), 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/* ─── Subviews ────────────────────────────────────────────────────────── */

function EmptyDay({ dateLabel, onSchedule }: { dateLabel: string; onSchedule: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
        <CalendarIcon className="h-5 w-5" />
      </div>
      <p className="text-[14px] font-semibold text-on-surface">No consultations scheduled</p>
      <p className="max-w-sm text-[12px] text-on-surface-variant">
        Nothing on {dateLabel}. Book an appointment or connect your practice calendar to auto-populate.
      </p>
      <Button size="sm" onClick={onSchedule}>
        <CalendarPlus className="h-3.5 w-3.5" />
        Schedule appointment
      </Button>
    </div>
  );
}

function DetailCard({
  appointment,
  onStart,
  onSchedule,
}: {
  appointment: Consultation | null;
  onStart: (id: string) => void;
  onSchedule: () => void;
}) {
  if (!appointment) {
    return (
      <section className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 text-center shadow-ambient-sm">
        <p className="text-[13px] font-semibold text-on-surface">Pick an appointment</p>
        <p className="mt-1 text-[12px] text-on-surface-variant">
          Select a session from the timeline to see the pre-consult brief and quick context.
        </p>
        <Button size="sm" variant="outline" className="mt-4" onClick={onSchedule}>
          <CalendarPlus className="h-3.5 w-3.5" />
          Schedule appointment
        </Button>
      </section>
    );
  }

  const dt = new Date(appointment.scheduled_for || appointment.created_at);
  const ModeIcon = isTelehealth(appointment) ? Video : Building2;
  const brief = appointment.visit_brief;
  const allergies = appointment.patient?.allergies ?? [];
  const conditions = appointment.patient?.conditions ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-ambient-sm">
      <div className="border-b border-outline-variant/60 px-6 py-5">
        <p className="eyebrow">
          Selected ·{' '}
          {dt.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar
            firstName={appointment.patient?.first_name ?? '?'}
            lastName={appointment.patient?.last_name ?? ''}
            size="lg"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-[18px] font-bold leading-tight tracking-[-0.01em] text-on-surface">
              {appointment.patient
                ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                : 'Unknown patient'}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-on-surface-variant">
              <ModeIcon className="h-3 w-3" />
              {consultDuration(appointment)} min · {isTelehealth(appointment) ? 'Telehealth' : 'In-clinic'}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-on-surface">
          <span className="font-bold">Reason for visit · </span>
          {appointment.reason_for_visit || appointment.consultation_type}
        </p>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => onStart(appointment.id)}>
            <Mic className="h-3.5 w-3.5" />
            Start consult
          </Button>
          <Button size="sm" variant="outline">
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Button>
        </div>

        <div className="border-t border-outline-variant/60 pt-4">
          <p className="eyebrow">Pre-consult brief</p>
          <p className="mt-2 text-[13px] leading-[1.55] text-on-surface-variant">
            {brief?.summary?.trim()
              ? brief.summary
              : 'No prep brief yet — generate one from the patient timeline before the visit to surface active problems, recent results, and likely agenda.'}
          </p>
        </div>

        <div className="border-t border-outline-variant/60 pt-4">
          <p className="eyebrow">Quick context</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {allergies.length === 0 && conditions.length === 0 && (
              <span className="text-[12px] text-on-surface-variant">
                No allergies or conditions recorded yet.
              </span>
            )}
            {allergies.map((a) => (
              <Badge key={a} variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {a}
              </Badge>
            ))}
            {conditions.map((c) => (
              <Badge key={c} variant="default">
                {c}
              </Badge>
            ))}
            {appointment.patient?.last_appointment_at && (
              <Badge variant="default">
                Last visit{' '}
                {new Date(appointment.patient.last_appointment_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FutureBookingsCard({
  futureAppointments,
  onPick,
  onSchedule,
}: {
  futureAppointments: Consultation[];
  onPick: (id: string) => void;
  onSchedule: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-ambient-sm">
      <p className="eyebrow">Future appointments</p>
      <div className="mt-3 flex flex-col">
        {futureAppointments.length === 0 ? (
          <p className="py-2 text-[12px] text-on-surface-variant">
            No upcoming bookings for this patient.
          </p>
        ) : (
          futureAppointments.map((f, i) => {
            const dt = consultDate(f);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onPick(f.id)}
                className={cn(
                  'flex items-center gap-3 py-2.5 text-left',
                  i !== futureAppointments.length - 1 && 'border-b border-outline-variant/60',
                )}
              >
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[10px] bg-surface-container-low">
                  <span className="text-[9px] font-bold uppercase text-outline">
                    {dt.toLocaleDateString('en-AU', { month: 'short' })}
                  </span>
                  <span className="-mt-0.5 text-[12px] font-bold text-on-surface">
                    {dt.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-on-surface">
                    {f.reason_for_visit || f.consultation_type}
                  </p>
                  <p className="text-[11px] text-outline">
                    {dt.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <RightChevron className="h-3.5 w-3.5 shrink-0 text-outline" />
              </button>
            );
          })
        )}
      </div>
      <button
        type="button"
        onClick={onSchedule}
        className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-outline bg-transparent text-[12px] font-semibold text-secondary transition-colors hover:bg-secondary-fixed"
      >
        <CalendarPlus className="h-3.5 w-3.5" />
        Schedule next visit
      </button>
    </section>
  );
}
