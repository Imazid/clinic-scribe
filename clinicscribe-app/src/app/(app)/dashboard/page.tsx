'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ListChecks,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { HeroStrip, HeroAccent } from '@/components/ui/HeroStrip';
import { Skeleton } from '@/components/ui/Skeleton';
import { InboxFeed, type InboxItem } from '@/components/dashboard/InboxFeed';
import { TodayRail } from '@/components/dashboard/TodayRail';
import { RecentPatientsTile } from '@/components/dashboard/RecentPatientsTile';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useNoteReviewLayout } from '@/lib/hooks/useNoteReviewLayout';
import { getRecentConsultations } from '@/lib/api/consultations';
import { getCareTasks, getVerificationQueue } from '@/lib/api/workflow';
import { getPatients } from '@/lib/api/patients';
import type { CareTask, Consultation, Patient, QAFinding } from '@/lib/types';

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

function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d.getTime() >= startOfWeek.getTime();
}

function eyebrowDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function deriveInboxItems(
  reviewQueue: Consultation[],
  todayConsults: Consultation[],
  tasks: CareTask[],
  reviewHref: (consultationId: string) => string = (id) => `/consultations/${id}/review`,
): InboxItem[] {
  const items: InboxItem[] = [];

  // Pending review — consultations awaiting clinician sign-off.
  for (const c of reviewQueue.slice(0, 8)) {
    if (!c.patient) continue;
    const note = Array.isArray(c.clinical_note)
      ? c.clinical_note[c.clinical_note.length - 1]
      : c.clinical_note;
    const findings: QAFinding[] = (note?.qa_findings as QAFinding[] | undefined) ?? [];
    const critical = findings.filter((f) => f.severity === 'critical' && !f.resolved).length;
    const warnings = findings.filter((f) => f.severity === 'warning' && !f.resolved).length;
    const conf = note?.confidence_scores?.overall;

    let tone: InboxItem['tone'] = 'success';
    let headline = 'Note ready for sign-off';
    let body = 'No flags. SOAP draft waiting for approval.';
    if (critical > 0) {
      tone = 'error';
      headline = `${critical} critical safety flag${critical === 1 ? '' : 's'}`;
      body = 'Critical finding surfaced — review before sign-off.';
    } else if (warnings > 0) {
      tone = 'warning';
      headline = `${warnings} warning${warnings === 1 ? '' : 's'} to resolve`;
      body = 'Verification flagged items in the draft.';
    }

    items.push({
      id: `review-${c.id}`,
      kind: 'review',
      patientFirstName: c.patient.first_name,
      patientLastName: c.patient.last_name,
      type: c.consultation_type,
      headline,
      body,
      meta: relativeTime(c.updated_at ?? c.created_at),
      confidence: typeof conf === 'number' ? conf : undefined,
      tone,
      href: reviewHref(c.id),
    });
  }

  // Prep needed — today's consultations that don't yet have a brief.
  for (const c of todayConsults) {
    if (!c.patient) continue;
    if (c.status !== 'scheduled' && c.status !== 'brief_ready') continue;
    if (c.visit_brief) continue;
    const startsIn = c.scheduled_for ? minutesUntil(c.scheduled_for) : null;
    items.push({
      id: `prep-${c.id}`,
      kind: 'prep',
      patientFirstName: c.patient.first_name,
      patientLastName: c.patient.last_name,
      type: c.consultation_type,
      headline: 'Brief not yet generated',
      body: c.reason_for_visit
        ? `Reason: ${c.reason_for_visit}`
        : 'Generate a pre-visit brief before the consult starts.',
      meta:
        startsIn != null && startsIn > 0
          ? `Starts in ${startsIn} min`
          : startsIn != null && startsIn <= 0
            ? 'Starting now'
            : 'Today',
      tone: 'info',
      href: `/prepare`,
    });
  }

  // Follow-ups — open care tasks, overdue first.
  const openTasks = tasks
    .filter((t) => ['open', 'in_progress'].includes(t.status))
    .sort((a, b) => {
      const ad = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    });
  for (const t of openTasks.slice(0, 4)) {
    const overdue = t.due_at != null && new Date(t.due_at).getTime() < Date.now();
    const patient = t.patient;
    items.push({
      id: `task-${t.id}`,
      kind: 'follow',
      patientFirstName: patient?.first_name ?? 'Unknown',
      patientLastName: patient?.last_name ?? 'Patient',
      type: t.title,
      headline: overdue ? 'Follow-up overdue' : 'Follow-up due soon',
      body: t.description || 'Open follow-up task.',
      meta: t.due_at ? formatDueShort(t.due_at) : 'No due date',
      tone: overdue ? 'error' : 'warning',
      href: `/close`,
    });
  }

  return items;
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatDueShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (days < -1) return `Overdue ${Math.abs(days)}d`;
  if (days === -1) return 'Due yesterday';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `Due in ${days}d`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function minutesUntil(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - Date.now()) / 60000);
}

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const addToast = useUIStore((state) => state.addToast);
  const { layout: noteReviewLayout } = useNoteReviewLayout();
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Consultation[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.clinic_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [recent, review, taskData, patients] = await Promise.all([
        getRecentConsultations(profile.clinic_id, 25),
        getVerificationQueue(profile.clinic_id),
        getCareTasks(profile.clinic_id, 'all'),
        getPatients(profile.clinic_id),
      ]);
      setRecentConsultations(recent);
      setReviewQueue(review);
      setTasks(taskData);
      setRecentPatients(
        [...patients]
          .sort((a, b) => {
            const ad = a.last_appointment_at ? new Date(a.last_appointment_at).getTime() : 0;
            const bd = b.last_appointment_at ? new Date(b.last_appointment_at).getTime() : 0;
            return bd - ad;
          })
          .slice(0, 5),
      );
    } catch (error) {
      console.error('[dashboard]', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to load dashboard',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [addToast, profile?.clinic_id]);

  useEffect(() => {
    load();
  }, [load]);

  const todayConsults = useMemo(
    () =>
      recentConsultations
        .filter((c) => isToday(c.scheduled_for) || isToday(c.started_at))
        .sort((a, b) => {
          const ad = a.scheduled_for ? new Date(a.scheduled_for).getTime() : Number.POSITIVE_INFINITY;
          const bd = b.scheduled_for ? new Date(b.scheduled_for).getTime() : Number.POSITIVE_INFINITY;
          return ad - bd;
        }),
    [recentConsultations],
  );

  const inboxItems = useMemo(
    () =>
      deriveInboxItems(
        reviewQueue,
        todayConsults,
        tasks,
        // When the user prefers the queue layout, route review items through
        // /notes/queue (with a hash fragment as a deep-link cue) instead of
        // diving straight into the single review screen.
        (id) => (noteReviewLayout === 'queue' ? `/notes/queue#${id}` : `/consultations/${id}/review`),
      ),
    [reviewQueue, todayConsults, tasks, noteReviewLayout],
  );

  const stats = useMemo(() => {
    const consultsToday = todayConsults.length;
    const telehealthToday = todayConsults.filter(
      (c) => c.consultation_type?.toLowerCase().includes('telehealth') || c.source?.toLowerCase() === 'telehealth',
    ).length;
    const awaitingReview = reviewQueue.length;
    const criticalReviews = reviewQueue.filter((c) => {
      const note = Array.isArray(c.clinical_note)
        ? c.clinical_note[c.clinical_note.length - 1]
        : c.clinical_note;
      const findings: QAFinding[] = (note?.qa_findings as QAFinding[] | undefined) ?? [];
      return findings.some((f) => f.severity === 'critical' && !f.resolved);
    }).length;
    const openTasks = tasks.filter((t) => ['open', 'in_progress'].includes(t.status));
    const overdueTasks = openTasks.filter(
      (t) => t.due_at != null && new Date(t.due_at).getTime() < Date.now(),
    );
    const finalisedThisWeek = recentConsultations.filter(
      (c) =>
        ['approved', 'closed', 'exported'].includes(c.status) &&
        c.updated_at &&
        isThisWeek(c.updated_at),
    ).length;

    return [
      {
        label: 'Consults today',
        value: consultsToday,
        sub: telehealthToday > 0 ? `${telehealthToday} telehealth` : '—',
        icon: Calendar,
        tone: 'default' as const,
      },
      {
        label: 'Awaiting review',
        value: awaitingReview,
        sub: criticalReviews > 0 ? `${criticalReviews} critical` : '0 critical',
        icon: ShieldCheck,
        tone: criticalReviews > 0 ? ('warning' as const) : ('default' as const),
      },
      {
        label: 'Open follow-ups',
        value: openTasks.length,
        sub:
          overdueTasks.length > 0
            ? `${overdueTasks.length} overdue`
            : 'On track',
        icon: ListChecks,
        tone: overdueTasks.length > 0 ? ('error' as const) : ('default' as const),
      },
      {
        label: 'Notes finalised',
        value: finalisedThisWeek,
        sub: 'this week',
        icon: CheckCircle2,
        tone: 'success' as const,
      },
    ];
  }, [todayConsults, reviewQueue, tasks, recentConsultations]);

  const nextConsultId = useMemo(() => {
    const future = todayConsults.find(
      (c) =>
        c.scheduled_for &&
        new Date(c.scheduled_for).getTime() >= Date.now() &&
        ['scheduled', 'brief_ready'].includes(c.status),
    );
    return future?.id ?? todayConsults[0]?.id ?? null;
  }, [todayConsults]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton variant="rectangular" className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Skeleton variant="rectangular" className="h-[480px] w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton variant="rectangular" className="h-72 w-full rounded-2xl" />
            <Skeleton variant="rectangular" className="h-56 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const greeting = timeOfDayGreeting();
  const firstName = profile?.first_name ?? '';

  return (
    <div className="space-y-8">
      <HeroStrip
        eyebrow={eyebrowDate()}
        title={
          firstName ? (
            <>
              {greeting}, <HeroAccent>{firstName}</HeroAccent>.
            </>
          ) : (
            <>
              {greeting}.
            </>
          )
        }
        description={
          inboxItems.length > 0
            ? `${inboxItems.length} item${inboxItems.length === 1 ? '' : 's'} need attention. Nothing leaves the system without you.`
            : 'Your inbox is clear. Nothing leaves the system without you.'
        }
        stats={stats}
        actions={
          <>
            <Link
              href="/prepare"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary"
            >
              <CalendarPlus className="h-4 w-4" /> Schedule
            </Link>
            <Link
              href="/capture"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/70 bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-ambient-sm transition-all hover:-translate-y-px hover:bg-primary-container hover:shadow-ambient"
            >
              <Mic className="h-4 w-4" /> Start consultation
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <InboxFeed items={inboxItems} />
        <div className="space-y-6">
          <TodayRail consultations={todayConsults} nextId={nextConsultId} />
          <RecentPatientsTile patients={recentPatients} />
        </div>
      </div>
    </div>
  );
}

