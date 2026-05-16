'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { TabBar } from '@/components/ui/TabBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import {
  getCareTasks,
  getGeneratedDocuments,
  updateCareTaskStatus,
  updateGeneratedDocument,
} from '@/lib/api/workflow';
import { updateConsultationStatus } from '@/lib/api/consultations';
import type { CareTask, GeneratedDocument } from '@/lib/types';
import { CloseoutView } from './CloseoutView';
import { InboxView } from './InboxView';

type TabView = 'closeout' | 'inbox';

const TAB_OPTIONS: { value: TabView; label: string; count?: number }[] = [
  { value: 'closeout', label: 'Closeout' },
  { value: 'inbox', label: 'Inbox' },
];

export default function ClosePage() {
  return (
    <Suspense>
      <ClosePageInner />
    </Suspense>
  );
}

function ClosePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useAuthStore((state) => state.profile);
  const addToast = useUIStore((state) => state.addToast);

  const view: TabView = searchParams.get('view') === 'inbox' ? 'inbox' : 'closeout';

  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [updatingDocumentId, setUpdatingDocumentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.clinic_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [taskData, documentData] = await Promise.all([
        getCareTasks(profile.clinic_id, 'all'),
        getGeneratedDocuments(profile.clinic_id),
      ]);
      setTasks(taskData);
      setDocuments(documentData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load tasks workspace';
      if (process.env.NODE_ENV !== 'production') {
        console.error('[close-load]', error);
      }
      setLoadError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, profile?.clinic_id]);

  useEffect(() => {
    load();
  }, [load]);

  const openTaskCount = useMemo(
    () => tasks.filter((t) => ['open', 'in_progress'].includes(t.status)).length,
    [tasks]
  );
  const pendingCloseoutCount = useMemo(
    () =>
      tasks.filter(
        (t) => t.consultation_id && ['open', 'in_progress'].includes(t.status)
      ).length,
    [tasks]
  );

  const tabOptions = useMemo(
    () =>
      TAB_OPTIONS.map((opt) => ({
        ...opt,
        count: opt.value === 'closeout' ? pendingCloseoutCount : openTaskCount,
      })),
    [openTaskCount, pendingCloseoutCount]
  );

  function setView(next: TabView) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', next);
    router.replace(`/close?${params.toString()}`, { scroll: false });
  }

  async function handleTaskComplete(task: CareTask) {
    setCompletingTaskId(task.id);
    try {
      const updatedTask = await updateCareTaskStatus(task.id, 'completed');
      const nextTasks = tasks.map((current) =>
        current.id === task.id ? updatedTask : current
      );
      setTasks(nextTasks);

      if (task.consultation_id) {
        const sameConsultationOpen = nextTasks.some(
          (current) =>
            current.consultation_id === task.consultation_id &&
            ['open', 'in_progress'].includes(current.status)
        );

        if (!sameConsultationOpen) {
          await updateConsultationStatus(task.consultation_id, 'closed');
        }
      }

      addToast('Task completed', 'success');
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to complete task',
        'error'
      );
    } finally {
      setCompletingTaskId(null);
    }
  }

  async function handleDocumentStatusUpdate(
    document: GeneratedDocument,
    status: GeneratedDocument['status']
  ) {
    setUpdatingDocumentId(document.id);
    try {
      const updated = await updateGeneratedDocument(document.id, { status });
      setDocuments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      addToast(
        status === 'ready'
          ? 'Document marked ready for clinician use'
          : 'Document marked sent',
        'success'
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to update document',
        'error'
      );
    } finally {
      setUpdatingDocumentId(null);
    }
  }

  function handleTaskCreated(task: CareTask) {
    setTasks((current) => [task, ...current]);
    addToast('Task created', 'success');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow"
        title="Tasks"
        description="Turn the plan into tracked tasks, patient-ready output, and a completed care loop."
      />

      <TabBar value={view} onChange={setView} options={tabOptions} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-error mb-2">
            Couldn&apos;t load tasks workspace
          </p>
          <p className="text-sm text-on-surface">{loadError}</p>
          <p className="mt-3 text-xs text-on-surface-variant">
            If you just deployed, the <code className="font-mono">care_tasks</code> /
            <code className="font-mono"> generated_documents</code> migrations may not have run yet.
            Tasks materialize automatically the first time you approve a clinical note in
            the consultation review screen.
          </p>
        </div>
      ) : view === 'closeout' ? (
        <CloseoutView
          tasks={tasks}
          documents={documents}
          onTaskComplete={handleTaskComplete}
          onDocumentStatusUpdate={handleDocumentStatusUpdate}
          completingTaskId={completingTaskId}
          updatingDocumentId={updatingDocumentId}
        />
      ) : (
        <InboxView
          tasks={tasks}
          onTaskComplete={handleTaskComplete}
          onTaskCreated={handleTaskCreated}
          clinicId={profile?.clinic_id}
          ownerUserId={profile?.id}
          completingTaskId={completingTaskId}
        />
      )}
    </div>
  );
}
