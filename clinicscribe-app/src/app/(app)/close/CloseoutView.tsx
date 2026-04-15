'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DOCUMENT_CHANNEL_LABELS,
  GENERATED_DOCUMENT_KIND_LABELS,
  GENERATED_DOCUMENT_STATUS_LABELS,
} from '@/lib/constants';
import { CareTaskBoard } from '@/components/workflow/CareTaskBoard';
import { formatDate } from '@/lib/utils';
import type { CareTask, GeneratedDocument } from '@/lib/types';
import {
  CheckCheck,
  ChevronDown,
  ChevronRight,
  FileOutput,
  Mail,
  MessageSquare,
  MessageSquareText,
  Printer,
  ExternalLink,
} from 'lucide-react';

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

interface ConsultationGroup {
  consultationId: string | null;
  tasks: CareTask[];
  sampleTask: CareTask;
  totalCount: number;
  completedCount: number;
  openCount: number;
  allDone: boolean;
  headerLabel: string;
  patientLabel: string | null;
}

function buildConsultationGroups(tasks: CareTask[]): ConsultationGroup[] {
  const buckets = new Map<string, CareTask[]>();
  const generalKey = '__general__';

  for (const task of tasks) {
    const key = task.consultation_id || generalKey;
    const list = buckets.get(key) ?? [];
    list.push(task);
    buckets.set(key, list);
  }

  const groups: ConsultationGroup[] = [];
  for (const [key, groupTasks] of buckets.entries()) {
    const sample = groupTasks[0];
    const completed = groupTasks.filter((t) => t.status === 'completed').length;
    const open = groupTasks.filter((t) => ['open', 'in_progress'].includes(t.status)).length;
    const consultationId = key === generalKey ? null : key;

    const patientLabel = sample.patient
      ? `${sample.patient.first_name} ${sample.patient.last_name}`
      : null;

    let headerLabel = 'General tasks';
    if (consultationId) {
      const consult = sample.consultation;
      const dateLabel = consult?.started_at
        ? formatDate(consult.started_at)
        : consult?.created_at
          ? formatDate(consult.created_at)
          : 'Consultation';
      const typeLabel = consult?.consultation_type ? ` · ${consult.consultation_type}` : '';
      const nameLabel = patientLabel ? ` · ${patientLabel}` : '';
      headerLabel = `${dateLabel}${typeLabel}${nameLabel}`;
    }

    groups.push({
      consultationId,
      tasks: groupTasks,
      sampleTask: sample,
      totalCount: groupTasks.length,
      completedCount: completed,
      openCount: open,
      allDone: open === 0,
      headerLabel,
      patientLabel,
    });
  }

  groups.sort((a, b) => {
    if (a.consultationId === null) return 1;
    if (b.consultationId === null) return -1;
    if (a.allDone !== b.allDone) return a.allDone ? 1 : -1;
    const aDate =
      a.sampleTask.consultation?.started_at ||
      a.sampleTask.consultation?.created_at ||
      a.sampleTask.created_at;
    const bDate =
      b.sampleTask.consultation?.started_at ||
      b.sampleTask.consultation?.created_at ||
      b.sampleTask.created_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return groups;
}

interface CloseoutViewProps {
  tasks: CareTask[];
  documents: GeneratedDocument[];
  onTaskComplete: (task: CareTask) => Promise<void>;
  onDocumentStatusUpdate: (
    document: GeneratedDocument,
    status: GeneratedDocument['status']
  ) => Promise<void>;
  completingTaskId: string | null;
  updatingDocumentId: string | null;
}

export function CloseoutView({
  tasks,
  documents,
  onTaskComplete,
  onDocumentStatusUpdate,
  completingTaskId,
  updatingDocumentId,
}: CloseoutViewProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedInstructionChannel, setSelectedInstructionChannel] =
    useState<DeliveryChannel>('print');

  const groups = useMemo(() => buildConsultationGroups(tasks), [tasks]);

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

  function toggleCollapsed(key: string) {
    setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  }

  function isCollapsed(group: ConsultationGroup) {
    const key = group.consultationId ?? '__general__';
    if (collapsed[key] !== undefined) return collapsed[key];
    return group.allDone;
  }

  if (tasks.length === 0 && documents.length === 0) {
    return (
      <EmptyState
        icon={CheckCheck}
        title="Nothing to close out"
        description="Approve a consultation note to materialize follow-up tasks and generated documents."
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => {
            const key = group.consultationId ?? '__general__';
            const hidden = isCollapsed(group);
            const chipText = group.allDone
              ? group.consultationId
                ? 'Ready to close'
                : 'All done'
              : `${group.completedCount} of ${group.totalCount} complete`;
            const chipVariant: 'success' | 'info' | 'default' = group.allDone
              ? 'success'
              : group.completedCount > 0
                ? 'info'
                : 'default';

            return (
              <Card key={key}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(key)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    {hidden ? (
                      <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {group.headerLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        {chipText}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge variant={chipVariant}>{chipText}</Badge>
                    {group.consultationId ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/consultations/${group.consultationId}/review`)
                        }
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Jump to review
                      </Button>
                    ) : null}
                  </div>
                </div>

                {!hidden ? (
                  <div className="mt-4">
                    <CareTaskBoard
                      tasks={group.tasks}
                      onComplete={onTaskComplete}
                      completingTaskId={completingTaskId}
                    />
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : null}

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
                        onClick={() => onDocumentStatusUpdate(patientInstructions, 'ready')}
                        disabled={updatingDocumentId === patientInstructions.id}
                        className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        Mark reviewed
                      </button>
                    ) : null}
                    {patientInstructions.status === 'ready' ? (
                      <button
                        type="button"
                        onClick={() => onDocumentStatusUpdate(patientInstructions, 'sent')}
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
                              onClick={() => onDocumentStatusUpdate(document, 'ready')}
                              disabled={updatingDocumentId === document.id}
                              className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                              Mark ready
                            </button>
                          ) : null}
                          {document.status === 'ready' ? (
                            <button
                              type="button"
                              onClick={() => onDocumentStatusUpdate(document, 'sent')}
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
  );
}
