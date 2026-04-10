'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { generateVisitBrief, getCareTasks, getPreparationQueue } from '@/lib/api/workflow';
import type { CareTask, Consultation, VisitBrief } from '@/lib/types';
import { VisitBriefCard } from '@/components/workflow/VisitBriefCard';
import { UpcomingDoctorTasks } from '@/components/workflow/UpcomingDoctorTasks';
import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  FileClock,
  Mic,
  Sparkles,
  Users,
} from 'lucide-react';

export default function PreparePage() {
  const router = useRouter();
  const profileId = useAuthStore((state) => state.profile?.id);
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const addToast = useUIStore((state) => state.addToast);
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const [queueData, taskData] = await Promise.all([
        getPreparationQueue(clinicId),
        getCareTasks(clinicId, 'all'),
      ]);
      setQueue(queueData);
      setTasks(taskData);
    } catch (error) {
      console.error(error);
      addToast('Failed to load preparation workflow', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, clinicId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerateBrief(consultationId: string) {
    setGeneratingId(consultationId);
    try {
      const brief = await generateVisitBrief(consultationId);
      setQueue((current) =>
        current.map((consultation) =>
          consultation.id === consultationId
            ? {
                ...consultation,
                status: 'brief_ready',
                visit_brief: brief as VisitBrief,
              }
            : consultation
        )
      );
      addToast('Visit brief generated', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to generate brief', 'error');
    } finally {
      setGeneratingId(null);
    }
  }

  const briefReady = queue.filter((consultation) => consultation.visit_brief).length;
  const readyToCapture = queue.filter((consultation) =>
    ['brief_ready', 'recording', 'review_pending'].includes(consultation.status)
  ).length;
  const staleBriefs = queue.filter((consultation) => {
    if (!consultation.visit_brief) return false;
    const createdAt = new Date(consultation.visit_brief.created_at);
    return (Date.now() - createdAt.getTime()) > 24 * 60 * 60 * 1000;
  }).length;
  const activeTasks = useMemo(
    () => tasks.filter((task) => ['open', 'in_progress'].includes(task.status)),
    [tasks]
  );
  const overdueTasks = useMemo(
    () => activeTasks.filter((task) => task.due_at && new Date(task.due_at) < new Date()),
    [activeTasks]
  );
  const doctorTasks = useMemo(
    () =>
      activeTasks.filter((task) => {
        if (!['note_plan', 'referral_draft'].includes(task.source)) return false;
        if (!profileId) return true;

        return (
          task.owner_user_id === profileId ||
          (!task.owner_user_id && task.consultation?.clinician_id === profileId)
        );
      }),
    [activeTasks, profileId]
  );
  const upcomingDoctorTasks = useMemo(() => doctorTasks.slice(0, 5), [doctorTasks]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workflow"
        title="Prepare"
        description="Brief yourself before the visit, surface open loops, and walk into the consult with context already assembled."
        variant="feature"
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              size="action"
              onClick={() => router.push('/patients')}
              className="w-full sm:w-auto"
            >
              <Users className="w-4 h-4" />
              Patient records
            </Button>
            <Button
              size="action"
              onClick={() => router.push('/capture')}
              className="w-full sm:w-auto"
            >
              <Mic className="w-4 h-4" />
              Go to capture
            </Button>
          </div>
        }
      />

      <section className="space-y-4">
        <div>
          <p className="label-text text-secondary mb-2">Summary</p>
          <h2 className="text-xl font-semibold text-on-surface">Workflow stats</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          <MetricCard icon={Sparkles} label="Briefs Ready" value={briefReady} />
          <MetricCard
            icon={FileClock}
            label="Open Loops"
            value={activeTasks.length}
            variant={activeTasks.length > 0 ? 'warning' : 'default'}
          />
          <MetricCard
            icon={ClipboardCheck}
            label="My AI Tasks"
            value={doctorTasks.length}
            variant={doctorTasks.length > 0 ? 'warning' : 'default'}
          />
          <MetricCard
            icon={FileClock}
            label="Overdue Tasks"
            value={overdueTasks.length}
            variant={overdueTasks.length > 0 ? 'error' : 'default'}
          />
          <MetricCard
            icon={FileClock}
            label="Stale Briefs"
            value={staleBriefs}
            variant={staleBriefs > 0 ? 'warning' : 'default'}
          />
          <MetricCard icon={Mic} label="Ready to Capture" value={readyToCapture} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-text text-secondary mb-2">Today&apos;s queue</p>
            <h2 className="text-2xl font-semibold text-on-surface">
              Preparation queue
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
              Review the next scheduled consults first, then generate or refresh briefs before capture.
            </p>
          </div>
          <Button
            variant="outline"
            size="action"
            onClick={() => router.push('/consultations/new')}
            className="w-full sm:w-auto"
          >
            New consultation
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" className="h-72 w-full" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No visits queued yet"
            description="Create or import consultations to start generating pre-visit briefs."
            actionLabel="New Consultation"
            onAction={() => router.push('/consultations/new')}
          />
        ) : (
          <div className="space-y-6">
            {queue.map((consultation) => (
              <VisitBriefCard
                key={consultation.id}
                consultation={consultation}
                brief={consultation.visit_brief}
                onGenerate={() => handleGenerateBrief(consultation.id)}
                isGenerating={generatingId === consultation.id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="label-text text-secondary mb-2">Open loops</p>
          <h2 className="text-xl font-semibold text-on-surface">Doctor task watchlist</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Active follow-up tasks extracted from AI-generated notes and waiting for action.
          </p>
        </div>

        {loading ? (
          <Skeleton variant="rectangular" className="h-80 w-full" />
        ) : (
          <UpcomingDoctorTasks tasks={upcomingDoctorTasks} totalCount={doctorTasks.length} />
        )}
      </section>
    </div>
  );
}
