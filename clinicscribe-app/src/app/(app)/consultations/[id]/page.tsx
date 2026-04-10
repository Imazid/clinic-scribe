'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConsultationStatusBadge } from '@/components/consultations/ConsultationStatusBadge';
import { TranscriptViewer } from '@/components/consultations/TranscriptViewer';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardTitle } from '@/components/ui/Card';
import { useConsultation } from '@/lib/hooks/useConsultation';
import { formatDateTime, formatDurationLong } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { WorkflowProgress } from '@/components/workflow/WorkflowProgress';
import { ScribeWorkspaceShell } from '@/components/scribe/ScribeWorkspaceShell';
import { SessionRail } from '@/components/scribe/SessionRail';
import { useWorkspaceTemplates } from '@/lib/hooks/useWorkspaceTemplates';

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { consultation, loading } = useConsultation(id);
  const { resolveByKey } = useWorkspaceTemplates();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" className="h-24 w-full rounded-[2rem]" />
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton variant="rectangular" className="h-96 rounded-[2rem]" />
          <div className="space-y-4">
            <Skeleton variant="rectangular" className="h-20 rounded-[2rem]" />
            <Skeleton variant="rectangular" className="h-[600px] rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return <div className="py-16 text-center text-on-surface-variant">Consultation not found.</div>;
  }

  const selectedTemplate = resolveByKey(consultation.template_key);
  const showVerifyButton =
    consultation.status === 'review_pending' ||
    consultation.status === 'generating' ||
    consultation.status === 'approved' ||
    consultation.status === 'closeout_pending' ||
    !!consultation.clinical_note;

  return (
    <ScribeWorkspaceShell
      title="Capture"
      description="Stay inside the session transcript and move into verification when ready."
      rail={<SessionRail activeConsultationId={consultation.id} />}
      metaBar={
        <div className="px-5 py-4 space-y-3">
          {/* Row 1: Patient info + actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {consultation.patient && (
                <Avatar
                  firstName={consultation.patient.first_name}
                  lastName={consultation.patient.last_name}
                  size="md"
                />
              )}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-on-surface truncate">
                  {consultation.patient
                    ? `${consultation.patient.first_name} ${consultation.patient.last_name}`
                    : consultation.consultation_type}
                </p>
                <p className="text-sm text-on-surface-variant truncate">
                  {consultation.consultation_type} &middot; {formatDateTime(consultation.created_at)}
                  {consultation.duration_seconds
                    ? ` \u00b7 ${formatDurationLong(consultation.duration_seconds)}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ConsultationStatusBadge status={consultation.status} />
              <Button variant="outline" onClick={() => router.push('/consultations/new')}>
                New session
              </Button>
              {showVerifyButton && (
                <Button onClick={() => router.push(`/consultations/${id}/review`)}>
                  <FileText className="h-4 w-4" />
                  Open verify
                </Button>
              )}
            </div>
          </div>

          {/* Row 2: Workflow progress */}
          <WorkflowProgress status={consultation.status} />
        </div>
      }
      workspace={
        <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1.55fr)_300px]">
          {/* Left: Transcript */}
          <div className="min-w-0 rounded-[1.75rem] border border-outline-variant/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,243,238,0.92)_100%)] p-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
              <p className="text-sm font-semibold text-on-surface">Transcript</p>
              <Badge variant={consultation.transcript ? 'success' : 'default'}>
                {consultation.transcript ? 'Ready' : 'Pending'}
              </Badge>
            </div>

            {consultation.transcript ? (
              <TranscriptViewer
                segments={consultation.transcript.segments}
                fullText={consultation.transcript.full_text}
              />
            ) : (
              <Card className="rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-low shadow-none">
                <div className="py-20 text-center text-sm text-on-surface-variant">
                  {consultation.status === 'transcribing'
                    ? 'Transcription is still running for this consult.'
                    : 'No transcript is available for this consult yet.'}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Session details */}
          <div className="space-y-4">
            <Card className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-low shadow-none">
              <CardTitle className="mb-3 text-base">Session details</CardTitle>
              <div className="space-y-3 text-sm">
                <DetailRow label="Template" value={selectedTemplate.name} />
                <DetailRow label="Type" value={consultation.consultation_type} />
                <DetailRow label="Created" value={formatDateTime(consultation.created_at)} />
                {consultation.duration_seconds && (
                  <DetailRow label="Duration" value={formatDurationLong(consultation.duration_seconds)} />
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-wrap gap-1.5">
                {selectedTemplate.sections.slice(0, 4).map((s) => (
                  <span key={s} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] text-on-surface-variant">
                    {s}
                  </span>
                ))}
              </div>
            </Card>

            {consultation.audio_recording && (
              <Card className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-low shadow-none">
                <CardTitle className="mb-3 text-base">Recording</CardTitle>
                <p className="mb-3 text-xs text-on-surface-variant">
                  {consultation.audio_recording.file_name}
                </p>
                <div className="rounded-xl bg-surface-container p-3">
                  <audio controls className="w-full" />
                </div>
              </Card>
            )}

            {consultation.visit_brief && (
              <Card className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-low shadow-none">
                <CardTitle className="mb-3 text-base">Visit brief</CardTitle>
                <div className="max-h-48 overflow-y-auto text-sm text-on-surface leading-relaxed">
                  {consultation.visit_brief.summary}
                </div>
              </Card>
            )}
          </div>
        </div>
      }
    />
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-right text-on-surface font-medium">{value}</span>
    </div>
  );
}
