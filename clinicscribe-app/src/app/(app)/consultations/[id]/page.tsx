'use client';

import { useParams, useRouter } from 'next/navigation';
import { useConsultation } from '@/lib/hooks/useConsultation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConsultationStatusBadge } from '@/components/consultations/ConsultationStatusBadge';
import { TranscriptViewer } from '@/components/consultations/TranscriptViewer';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime, formatDurationLong } from '@/lib/utils';
import { FileText, Clock, User, Stethoscope } from 'lucide-react';

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { consultation, loading } = useConsultation(id);

  if (loading) {
    return <div className="space-y-4"><Skeleton variant="rectangular" className="h-8 w-48" /><Skeleton variant="rectangular" className="h-64 w-full" /></div>;
  }

  if (!consultation) return <div className="text-center py-16 text-on-surface-variant">Consultation not found.</div>;

  const c = consultation;

  return (
    <div>
      <BreadcrumbNav items={[{ label: 'Consultations', href: '/consultations' }, { label: c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : 'Detail' }]} />
      <PageHeader
        title={c.consultation_type || 'Consultation'}
        className="mt-4"
        actions={
          <div className="flex items-center gap-3">
            <ConsultationStatusBadge status={c.status} />
            {(c.status === 'review_pending' || c.status === 'generating') && (
              <Button onClick={() => router.push(`/consultations/${id}/review`)}>
                <FileText className="w-4 h-4" /> Review Note
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info panel */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Details</CardTitle>
            <div className="space-y-3 text-sm">
              {c.patient && (
                <div className="flex items-center gap-3">
                  <Avatar firstName={c.patient.first_name} lastName={c.patient.last_name} size="sm" />
                  <div>
                    <p className="font-medium text-on-surface">{c.patient.first_name} {c.patient.last_name}</p>
                    <p className="text-xs text-on-surface-variant">Patient</p>
                  </div>
                </div>
              )}
              {c.clinician && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <User className="w-4 h-4" />
                  Dr. {c.clinician.first_name} {c.clinician.last_name}
                </div>
              )}
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Stethoscope className="w-4 h-4" /> {c.consultation_type}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Clock className="w-4 h-4" /> {formatDateTime(c.created_at)}
              </div>
              {c.duration_seconds && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Clock className="w-4 h-4" /> Duration: {formatDurationLong(c.duration_seconds)}
                </div>
              )}
            </div>
          </Card>

          {/* Audio playback */}
          {c.audio_recording && (
            <Card>
              <CardTitle className="mb-3">Recording</CardTitle>
              <p className="text-xs text-on-surface-variant mb-2">{c.audio_recording.file_name}</p>
              <audio controls className="w-full" />
            </Card>
          )}
        </div>

        {/* Transcript */}
        <div className="lg:col-span-2">
          {c.transcript ? (
            <TranscriptViewer segments={c.transcript.segments} fullText={c.transcript.full_text} />
          ) : (
            <Card>
              <div className="text-center py-12 text-on-surface-variant">
                {c.status === 'transcribing' ? 'Transcription in progress...' : 'No transcript available.'}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
