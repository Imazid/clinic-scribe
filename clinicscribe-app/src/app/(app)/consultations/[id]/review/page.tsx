'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { NoteApprovalBar } from '@/components/notes/NoteApprovalBar';
import { MedicationDraftSection } from '@/components/notes/MedicationDraft';
import { FollowUpTasksSection } from '@/components/notes/FollowUpTasks';
import { ReferralDraftSection } from '@/components/notes/ReferralDraft';
import { Skeleton } from '@/components/ui/Skeleton';
import { useConsultation } from '@/lib/hooks/useConsultation';
import { useNoteGeneration } from '@/lib/hooks/useNoteGeneration';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { updateConsultationStatus } from '@/lib/api/consultations';
import { createAuditLog } from '@/lib/api/audit';
import { createClient } from '@/lib/supabase/client';
import type { SOAPNote, ConfidenceScores, MedicationDraft, FollowUpTask, ClinicalNote } from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { consultation, loading: consultationLoading, refresh } = useConsultation(id);
  const { isGenerating, generate } = useNoteGeneration();
  const profile = useAuthStore((s) => s.profile);
  const addToast = useUIStore((s) => s.addToast);

  const [content, setContent] = useState<SOAPNote>({ subjective: '', objective: '', assessment: '', plan: '' });
  const [confidence, setConfidence] = useState<ConfidenceScores>({ subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 });
  const [medications, setMedications] = useState<MedicationDraft[]>([]);
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([]);
  const [referrals, setReferrals] = useState<string[]>([]);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Load existing note or generate new one
  useEffect(() => {
    if (!consultation) return;

    // Supabase joins one-to-many as arrays — grab the latest note
    const rawNote = consultation.clinical_note;
    const existingNote: ClinicalNote | undefined = Array.isArray(rawNote)
      ? rawNote[rawNote.length - 1]
      : rawNote ?? undefined;

    if (existingNote?.content) {
      setContent(existingNote.content);
      setConfidence(existingNote.confidence_scores || { subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 });
      setMedications(existingNote.medications || []);
      setFollowUpTasks(existingNote.follow_up_tasks || []);
      setReferrals(existingNote.referrals || []);
      setNoteId(existingNote.id);
      setIsApproved(existingNote.is_approved);
    } else if (consultation.transcript && consultation.status === 'generating') {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultation?.id]);

  const handleGenerate = useCallback(async () => {
    if (!consultation?.transcript) return;

    try {
      const patientContext = consultation.patient
        ? `Name: ${consultation.patient.first_name} ${consultation.patient.last_name}, DOB: ${consultation.patient.date_of_birth}, Allergies: ${consultation.patient.allergies.join(', ') || 'None known'}, Conditions: ${consultation.patient.conditions.join(', ') || 'None'}`
        : undefined;

      const result = await generate(id, consultation.transcript.full_text, patientContext);

      setContent(result.content);
      setConfidence(result.confidence_scores);
      setMedications(result.medications || []);
      setFollowUpTasks(result.follow_up_tasks || []);
      setReferrals(result.referrals || []);

      // Save note to database
      const supabase = createClient();
      const { data: note } = await supabase.from('clinical_notes').insert({
        consultation_id: id,
        version: 1,
        format: 'soap',
        content: result.content,
        confidence_scores: result.confidence_scores,
        medications: result.medications || [],
        follow_up_tasks: result.follow_up_tasks || [],
        referrals: result.referrals || [],
        ai_model: result.ai_model,
        ai_prompt_version: result.ai_prompt_version,
        is_approved: false,
      }).select().single();

      if (note) setNoteId(note.id);
      await updateConsultationStatus(id, 'review_pending');
      await refresh();
    } catch {
      addToast('Failed to generate note', 'error');
    }
  }, [consultation, id, generate, refresh, addToast]);

  function handleContentChange(section: keyof SOAPNote, value: string) {
    setContent((prev) => ({ ...prev, [section]: value }));
  }

  function handleVerifyMed(index: number) {
    setMedications((prev) => prev.map((m, i) => i === index ? { ...m, verified: !m.verified } : m));
  }

  function handleToggleTask(index: number) {
    setFollowUpTasks((prev) => prev.map((t, i) => i === index ? { ...t, completed: !t.completed } : t));
  }

  async function handleApprove() {
    if (!noteId || !profile) return;
    setIsApproving(true);

    try {
      const supabase = createClient();
      await supabase.from('clinical_notes').update({
        content,
        medications,
        follow_up_tasks: followUpTasks,
        is_approved: true,
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', noteId);

      await updateConsultationStatus(id, 'approved');
      await createAuditLog(profile.clinic_id, profile.id, 'note_approved', 'clinical_note', noteId, {
        consultation_id: id,
      });

      setIsApproved(true);
      addToast('Note approved and signed', 'success');
    } catch {
      addToast('Failed to approve note', 'error');
    } finally {
      setIsApproving(false);
    }
  }

  async function handleExportPDF() {
    if (!consultation) return;
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          patientName: consultation.patient
            ? `${consultation.patient.first_name} ${consultation.patient.last_name}`
            : 'Unknown Patient',
          consultationDate: new Date(consultation.created_at).toLocaleDateString('en-AU', {
            day: 'numeric', month: 'long', year: 'numeric',
          }),
          clinicianName: profile
            ? `Dr. ${profile.first_name} ${profile.last_name}`
            : 'Clinician',
          medications,
          followUpTasks,
          referrals,
        }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clinical-note-${consultation.patient?.last_name || 'note'}-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Note exported successfully', 'success');
    } catch {
      addToast('Failed to export note', 'error');
    }
  }

  async function handleCopy() {
    const text = `SUBJECTIVE:\n${content.subjective}\n\nOBJECTIVE:\n${content.objective}\n\nASSESSMENT:\n${content.assessment}\n\nPLAN:\n${content.plan}`;
    await navigator.clipboard.writeText(text);
    addToast('Note copied to clipboard', 'success');
  }

  if (consultationLoading) {
    return <div className="space-y-4"><Skeleton variant="rectangular" className="h-8 w-48" /><Skeleton variant="rectangular" className="h-96 w-full" /></div>;
  }

  if (!consultation) return <div className="text-center py-16 text-on-surface-variant">Consultation not found.</div>;

  return (
    <div>
      <BreadcrumbNav items={[
        { label: 'Consultations', href: '/consultations' },
        { label: consultation.patient ? `${consultation.patient.first_name} ${consultation.patient.last_name}` : 'Consultation', href: `/consultations/${id}` },
        { label: 'Review' },
      ]} />
      <PageHeader title="Review Clinical Note" className="mt-4" />

      {isGenerating && (
        <Card className="mb-6">
          <p className="text-sm text-on-surface-variant mb-2">Generating clinical note with AI...</p>
          <ProgressBar value={50} color="secondary" />
        </Card>
      )}

      {content.subjective && (
        <>
          <NoteEditor
            content={content}
            confidence={confidence}
            transcript={{
              fullText: consultation.transcript?.full_text || '',
              segments: consultation.transcript?.segments || [],
            }}
            onContentChange={handleContentChange}
            readOnly={isApproved}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="lg:col-start-2 space-y-6">
              <MedicationDraftSection medications={medications} onVerify={handleVerifyMed} />
              <FollowUpTasksSection tasks={followUpTasks} onToggle={handleToggleTask} />
              <ReferralDraftSection referrals={referrals} />
            </div>
          </div>

          <div className="mt-6">
            <NoteApprovalBar
              overallConfidence={confidence.overall}
              isApproved={isApproved}
              onApprove={handleApprove}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopy}
              isApproving={isApproving}
            />
          </div>
        </>
      )}
    </div>
  );
}
