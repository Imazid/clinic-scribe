'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import {
  DOCUMENT_CHANNEL_LABELS,
  GENERATED_DOCUMENT_KIND_LABELS,
  GENERATED_DOCUMENT_STATUS_LABELS,
} from '@/lib/constants';
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
import { CareTaskBoard } from '@/components/workflow/CareTaskBoard';
import { CheckCheck, FileOutput, Mail, MessageSquare, MessageSquareText, Printer } from 'lucide-react';

type DeliveryChannel = 'print' | 'sms' | 'email';

function getDocumentChannels(document: GeneratedDocument | null) {
  const raw = document?.metadata?.channel_options;
  if (!Array.isArray(raw)) {
    return ['print'] as DeliveryChannel[];
  }

  const channels = raw.filter(
    (value): value is DeliveryChannel =>
      value === 'print' || value === 'sms' || value === 'email'
  );

  return channels.length > 0 ? channels : (['print'] as DeliveryChannel[]);
}

function getDocumentVariant(document: GeneratedDocument, channel: DeliveryChannel) {
  const variants = document.metadata?.channel_variants;
  if (variants && typeof variants === 'object') {
    const candidate = (variants as Record<string, unknown>)[channel];
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return document.content;
}

function isExternallyShareable(document: GeneratedDocument) {
  return !['patient_summary', 'visit_summary'].includes(document.kind);
}

function getChannelIcon(channel: DeliveryChannel) {
  switch (channel) {
    case 'email':
      return Mail;
    case 'sms':
      return MessageSquare;
    case 'print':
    default:
      return Printer;
  }
}

export default function ClosePage() {
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const addToast = useUIStore((state) => state.addToast);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [updatingDocumentId, setUpdatingDocumentId] = useState<string | null>(null);
  const [selectedInstructionChannel, setSelectedInstructionChannel] =
    useState<DeliveryChannel>('print');

  const load = useCallback(async () => {
    if (!clinicId) return;
    try {
      const [taskData, documentData] = await Promise.all([
        getCareTasks(clinicId, 'all'),
        getGeneratedDocuments(clinicId),
      ]);
      setTasks(taskData);
      setDocuments(documentData);
    } catch (error) {
      console.error(error);
      addToast('Failed to load tasks workspace', 'error');
    }
  }, [addToast, clinicId]);

  useEffect(() => {
    load();
  }, [load]);

  const openTasks = useMemo(
    () => tasks.filter((task) => ['open', 'in_progress'].includes(task.status)),
    [tasks]
  );
  const patientInstructions = useMemo(
    () =>
      documents.find((document) => document.kind === 'patient_instructions') || null,
    [documents]
  );
  const otherDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          document.kind !== 'patient_instructions' &&
          document.kind !== 'patient_summary'
      ),
    [documents]
  );
  const internalSummaries = useMemo(
    () => documents.filter((document) => document.kind === 'patient_summary'),
    [documents]
  );
  const instructionChannels = useMemo(
    () => getDocumentChannels(patientInstructions),
    [patientInstructions]
  );
  const instructionPreview = useMemo(() => {
    if (!patientInstructions) {
      return '';
    }

    return getDocumentVariant(patientInstructions, selectedInstructionChannel);
  }, [patientInstructions, selectedInstructionChannel]);

  useEffect(() => {
    if (!instructionChannels.includes(selectedInstructionChannel)) {
      setSelectedInstructionChannel(instructionChannels[0] || 'print');
    }
  }, [instructionChannels, selectedInstructionChannel]);

  async function handleCompleteTask(task: CareTask) {
    setCompletingTaskId(task.id);
    try {
      const updatedTask = await updateCareTaskStatus(task.id, 'completed');
      const nextTasks = tasks.map((current) => (current.id === task.id ? updatedTask : current));
      setTasks(nextTasks);

      const sameConsultationOpen = nextTasks.some(
        (current) =>
          current.consultation_id === task.consultation_id &&
          ['open', 'in_progress'].includes(current.status)
      );

      if (!sameConsultationOpen) {
        await updateConsultationStatus(task.consultation_id, 'closed');
      }

      addToast('Task completed', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to complete task', 'error');
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
      addToast(error instanceof Error ? error.message : 'Failed to update document', 'error');
    } finally {
      setUpdatingDocumentId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Workflow"
        title="Tasks"
        description="Turn the plan into tracked tasks, patient-ready output, and a completed care loop."
      />

      {tasks.length === 0 && documents.length === 0 ? (
        <EmptyState
          icon={CheckCheck}
          title="No tasks yet"
          description="Approve a consultation note to materialize follow-up tasks and generated documents."
        />
      ) : (
        <div className="space-y-6">
          <CareTaskBoard
            tasks={tasks}
            onComplete={handleCompleteTask}
            completingTaskId={completingTaskId}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquareText className="w-5 h-5 text-secondary" />
                <CardTitle>Patient Instructions</CardTitle>
              </div>
              {patientInstructions ? (
                <div className="rounded-xl bg-surface-container-low px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          patientInstructions.status === 'sent'
                            ? 'success'
                            : patientInstructions.status === 'ready'
                              ? 'info'
                              : 'warning'
                        }
                      >
                        {GENERATED_DOCUMENT_STATUS_LABELS[patientInstructions.status]}
                      </Badge>
                      {instructionChannels.map((channel) => {
                        const Icon = getChannelIcon(channel);
                        return (
                          <button
                            key={channel}
                            type="button"
                            onClick={() => setSelectedInstructionChannel(channel)}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                              selectedInstructionChannel === channel
                                ? 'bg-secondary text-white'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {DOCUMENT_CHANNEL_LABELS[channel]}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      {patientInstructions.status === 'draft' ? (
                        <button
                          type="button"
                          onClick={() => handleDocumentStatusUpdate(patientInstructions, 'ready')}
                          disabled={updatingDocumentId === patientInstructions.id}
                          className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Mark reviewed
                        </button>
                      ) : null}
                      {patientInstructions.status === 'ready' ? (
                        <button
                          type="button"
                          onClick={() => handleDocumentStatusUpdate(patientInstructions, 'sent')}
                          disabled={updatingDocumentId === patientInstructions.id}
                          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Mark sent
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {selectedInstructionChannel === 'email' &&
                  typeof patientInstructions.metadata?.email_subject === 'string' ? (
                    <div className="mb-3 rounded-lg bg-surface-container px-3 py-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                        Email subject
                      </p>
                      <p className="mt-1 text-sm text-on-surface">
                        {patientInstructions.metadata.email_subject}
                      </p>
                    </div>
                  ) : null}
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{instructionPreview}</p>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Patient instructions will appear here after note approval.
                </p>
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <FileOutput className="w-5 h-5 text-secondary" />
                <CardTitle>Generated Document Pack</CardTitle>
              </div>
              {otherDocuments.length === 0 && internalSummaries.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Closeout documents will appear here after note approval.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...otherDocuments, ...internalSummaries].map((document) => (
                    <div key={document.id} className="rounded-xl bg-surface-container-low px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-on-surface">{document.title}</p>
                            <Badge
                              variant={
                                document.status === 'sent'
                                  ? 'success'
                                  : document.status === 'ready'
                                    ? 'info'
                                    : 'warning'
                              }
                            >
                              {GENERATED_DOCUMENT_STATUS_LABELS[document.status]}
                            </Badge>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {GENERATED_DOCUMENT_KIND_LABELS[document.kind] ||
                              document.kind.replace('_', ' ')}
                            {document.patient
                              ? ` · ${document.patient.first_name} ${document.patient.last_name}`
                              : ''}
                          </p>
                        </div>
                        {isExternallyShareable(document) ? (
                          <div className="flex items-center gap-2">
                            {document.status === 'draft' ? (
                              <button
                                type="button"
                                onClick={() => handleDocumentStatusUpdate(document, 'ready')}
                                disabled={updatingDocumentId === document.id}
                                className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                              >
                                Mark ready
                              </button>
                            ) : null}
                            {document.status === 'ready' ? (
                              <button
                                type="button"
                                onClick={() => handleDocumentStatusUpdate(document, 'sent')}
                                disabled={updatingDocumentId === document.id}
                                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                              >
                                Mark sent
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      {getDocumentChannels(document).length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getDocumentChannels(document).map((channel) => (
                            <Badge key={channel} variant="default">
                              {DOCUMENT_CHANNEL_LABELS[channel]}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-sm text-on-surface-variant line-clamp-5 whitespace-pre-wrap">
                        {document.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
