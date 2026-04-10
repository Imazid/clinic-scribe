'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { NoteApprovalBar } from '@/components/notes/NoteApprovalBar';
import { MedicationDraftSection } from '@/components/notes/MedicationDraft';
import { FollowUpTasksSection } from '@/components/notes/FollowUpTasks';
import { ReferralDraftSection } from '@/components/notes/ReferralDraft';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';
import { useConsultation } from '@/lib/hooks/useConsultation';
import { useNoteGeneration } from '@/lib/hooks/useNoteGeneration';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { updateConsultationStatus } from '@/lib/api/consultations';
import { createAuditLog } from '@/lib/api/audit';
import { createClient } from '@/lib/supabase/client';
import { generateProvenance, generateQAFindings, materializeCloseout } from '@/lib/api/workflow';
import type {
  SOAPNote,
  ConfidenceScores,
  MedicationDraft,
  FollowUpTask,
  ClinicalNote,
  NoteProvenanceItem,
  QAFinding,
} from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  DiscrepancySummary,
  ProvenanceSummary,
  QAFindingSummary,
  QAScorecard,
} from '@/components/workflow/VerificationSummary';
import { DiscrepancyComparison } from '@/components/workflow/DiscrepancyComparison';
import { EvidencePanel } from '@/components/workflow/EvidencePanel';
import { PatientSummaryCard } from '@/components/workflow/PatientSummaryCard';
import { WorkflowPackSummaryCard } from '@/components/workflow/WorkflowPackSummaryCard';
import { getWorkflowPackByTemplateKey } from '@/lib/workflow/packs';
import { useWorkspaceTemplates } from '@/lib/hooks/useWorkspaceTemplates';
import { WorkflowProgress } from '@/components/workflow/WorkflowProgress';
import { Waypoints, ShieldCheck, ArrowLeftRight, BookOpen, FileText, Sparkles } from 'lucide-react';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { consultation, loading: consultationLoading, refresh } = useConsultation(id);
  const { isGenerating, generate } = useNoteGeneration();
  const profile = useAuthStore((s) => s.profile);
  const addToast = useUIStore((s) => s.addToast);
  const { loading: templatesLoading, resolveByKey } = useWorkspaceTemplates();

  const [content, setContent] = useState<SOAPNote>({ subjective: '', objective: '', assessment: '', plan: '' });
  const [confidence, setConfidence] = useState<ConfidenceScores>({ subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 });
  const [medications, setMedications] = useState<MedicationDraft[]>([]);
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([]);
  const [referrals, setReferrals] = useState<string[]>([]);
  const [provenance, setProvenance] = useState<NoteProvenanceItem[]>([]);
  const [qaFindings, setQaFindings] = useState<QAFinding[]>([]);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [resolvedFindings, setResolvedFindings] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [editingSection, setEditingSection] = useState<keyof SOAPNote | null>(null);
  const [contentEdited, setContentEdited] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  const activeTemplateKey = searchParams.get('template') ?? consultation?.template_key ?? null;
  const selectedTemplate = resolveByKey(activeTemplateKey);
  const templateResolved = !activeTemplateKey || selectedTemplate.key === activeTemplateKey || !templatesLoading;

  const runVerificationArtifacts = useCallback(
    async (
      activeNoteId: string,
      nextContent: SOAPNote,
      nextConfidence: ConfidenceScores,
      nextMedications: MedicationDraft[],
      nextTasks: FollowUpTask[],
      nextReferrals: string[]
    ) => {
      const provenanceResult = await generateProvenance(id, {
        noteId: activeNoteId,
        content: nextContent,
        confidence_scores: nextConfidence,
        medications: nextMedications,
        follow_up_tasks: nextTasks,
        referrals: nextReferrals,
      });
      setProvenance(provenanceResult.provenance_map);

      const qaResult = await generateQAFindings(id, {
        noteId: activeNoteId,
        content: nextContent,
        confidence_scores: nextConfidence,
        medications: nextMedications,
        follow_up_tasks: nextTasks,
        provenance_map: provenanceResult.provenance_map,
      });
      setQaFindings(qaResult.qa_findings);

      return {
        provenance: provenanceResult.provenance_map,
        qaFindings: qaResult.qa_findings,
      };
    },
    [id]
  );

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
      setProvenance(existingNote.provenance_map || []);
      setQaFindings(existingNote.qa_findings || []);
      setNoteId(existingNote.id);
      setIsApproved(existingNote.is_approved);
      if (
        existingNote.id &&
        (!existingNote.provenance_map?.length || !existingNote.qa_findings?.length)
      ) {
        runVerificationArtifacts(
          existingNote.id,
          existingNote.content,
          existingNote.confidence_scores || { subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 },
          existingNote.medications || [],
          existingNote.follow_up_tasks || [],
          existingNote.referrals || []
        ).catch((error) => console.error('Verification refresh failed:', error));
      }
    } else if (consultation.transcript && templateResolved) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultation?.id, templateResolved]);

  const handleGenerate = useCallback(async () => {
    if (!consultation?.transcript) return;

    try {
      const patientContext = consultation.patient
        ? `Name: ${consultation.patient.first_name} ${consultation.patient.last_name}, DOB: ${consultation.patient.date_of_birth}, Allergies: ${consultation.patient.allergies.join(', ') || 'None known'}, Conditions: ${consultation.patient.conditions.join(', ') || 'None'}`
        : undefined;

      const result = await generate(
        id,
        consultation.transcript.full_text,
        patientContext,
        activeTemplateKey,
        selectedTemplate
      );

      setContent(result.content);
      setConfidence(result.confidence_scores);
      setMedications(result.medications || []);
      setFollowUpTasks(result.follow_up_tasks || []);
      setReferrals(result.referrals || []);

      // Save note to database
      const supabase = createClient();
      const noteInsert = {
        consultation_id: id,
        version: 1,
        format: 'soap',
        template_key: activeTemplateKey,
        content: result.content,
        confidence_scores: result.confidence_scores,
        medications: result.medications || [],
        follow_up_tasks: result.follow_up_tasks || [],
        referrals: result.referrals || [],
        provenance_map: [],
        qa_findings: [],
        verification_status: 'pending',
        patient_summary_snapshot: {},
        ai_model: result.ai_model,
        ai_prompt_version: result.ai_prompt_version,
        is_approved: false,
      };

      const initialInsert = await supabase.from('clinical_notes').insert(noteInsert).select().single();
      let note = initialInsert.data;
      const noteInsertError = initialInsert.error;

      if (noteInsertError) {
        const legacyInsert = Object.fromEntries(
          Object.entries(noteInsert).filter(([key]) => key !== 'template_key')
        );
        const fallback = await supabase.from('clinical_notes').insert(legacyInsert).select().single();
        note = fallback.data;
      }

      if (note) {
        setNoteId(note.id);
        await runVerificationArtifacts(
          note.id,
          result.content,
          result.confidence_scores,
          result.medications || [],
          result.follow_up_tasks || [],
          result.referrals || []
        );
      }
      await updateConsultationStatus(id, 'review_pending');
      await refresh();
    } catch {
      addToast('Failed to generate note', 'error');
    }
  }, [
    consultation,
    id,
    generate,
    refresh,
    addToast,
    runVerificationArtifacts,
    activeTemplateKey,
    selectedTemplate,
  ]);

  function handleContentChange(section: keyof SOAPNote, value: string) {
    setContent((prev) => ({ ...prev, [section]: value }));
    setContentEdited(true);
  }

  function handleVerifyMed(index: number) {
    setMedications((prev) => prev.map((m, i) => i === index ? { ...m, verified: !m.verified } : m));
  }

  function handleToggleTask(index: number) {
    setFollowUpTasks((prev) => prev.map((t, i) => i === index ? { ...t, completed: !t.completed } : t));
  }

  async function handleApprove() {
    if (!profile) {
      addToast('You must be signed in to approve notes', 'error');
      return;
    }
    if (!noteId) {
      addToast('No clinical note to approve. Try regenerating the note.', 'error');
      return;
    }
    setIsApproving(true);

    try {
      // Run verification — non-blocking: if it fails, approve anyway with current data
      let verifiedProvenance = provenance;
      let verifiedQaFindings = qaFindings;
      try {
        const verification = await runVerificationArtifacts(
          noteId,
          content,
          confidence,
          medications,
          followUpTasks,
          referrals
        );
        verifiedProvenance = verification.provenance;
        verifiedQaFindings = verification.qaFindings;
      } catch (verifyErr) {
        console.error('Verification failed, proceeding with existing data:', verifyErr);
      }

      const unresolvedCritical = verifiedQaFindings.filter(
        (finding) => finding.severity === 'critical' && !resolvedFindings.has(finding.code)
      );
      if (unresolvedCritical.length > 0) {
        addToast(`Resolve ${unresolvedCritical.length} critical QA finding${unresolvedCritical.length > 1 ? 's' : ''} before approval`, 'error');
        setIsApproving(false);
        return;
      }

      const supabase = createClient();
      const now = new Date().toISOString();
      const coreUpdate = {
        content,
        confidence_scores: confidence,
        medications,
        follow_up_tasks: followUpTasks,
        referrals,
        provenance_map: verifiedProvenance,
        qa_findings: verifiedQaFindings,
        verification_status: 'approved',
        is_approved: true,
        approved_by: profile.id,
        approved_at: now,
        updated_at: now,
      };

      // Try with template_key first, fall back without it if column doesn't exist
      let { error: noteUpdateError } = await supabase
        .from('clinical_notes')
        .update({ ...coreUpdate, template_key: activeTemplateKey })
        .eq('id', noteId);

      if (noteUpdateError) {
        const fallback = await supabase.from('clinical_notes').update(coreUpdate).eq('id', noteId);
        noteUpdateError = fallback.error;
      }

      if (noteUpdateError) {
        throw new Error(noteUpdateError.message || 'Failed to update clinical note');
      }

      let taskCount = 0;
      try {
        const closeout = await materializeCloseout(id, noteId);
        taskCount = closeout.task_count;
      } catch (closeoutErr) {
        console.error('Closeout materialization failed:', closeoutErr);
      }

      try {
        await createAuditLog(profile.clinic_id, profile.id, 'note_approved', 'clinical_note', noteId, {
          consultation_id: id,
        });
      } catch (auditErr) {
        console.error('Audit log failed:', auditErr);
      }

      setIsApproved(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      addToast(
        taskCount > 0
          ? `Note approved. ${taskCount} task${taskCount === 1 ? '' : 's'} moved to tasks.`
          : 'Note approved successfully.',
        'success'
      );
      await refresh();
    } catch (err) {
      console.error('Approve failed:', err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to approve note. Please try again.';
      addToast(msg, 'error');
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

  const [activePanel, setActivePanel] = useState<string>('safety');

  if (consultationLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" className="h-5 w-24 rounded-full" />
            <Skeleton variant="rectangular" className="h-5 w-4 rounded-full" />
            <Skeleton variant="rectangular" className="h-5 w-32 rounded-full" />
            <Skeleton variant="rectangular" className="h-5 w-4 rounded-full" />
            <Skeleton variant="rectangular" className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton variant="rectangular" className="h-8 w-64" />
        </div>

        {/* Scorecard + progress skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangular" className="h-10 w-40 rounded-xl" />
          <Skeleton variant="rectangular" className="h-10 flex-1 rounded-xl" />
        </div>

        {/* Main workspace skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Editor skeleton */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-6"
            >
              {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section, i) => (
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton variant="rectangular" className="h-3 w-3 rounded-full" />
                    <Skeleton variant="rectangular" className="h-4 w-20 rounded-md" />
                    <Skeleton variant="rectangular" className="h-5 w-10 rounded-full ml-auto" />
                  </div>
                  <div className="space-y-1.5 pl-5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-[90%]" />
                    <Skeleton className="h-3 w-[75%]" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom cards skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 space-y-3"
                >
                  <Skeleton variant="rectangular" className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-[60%]" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" className="h-8 w-16 rounded-lg" />
              ))}
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 space-y-3">
              <Skeleton variant="rectangular" className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[80%]" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!consultation) return <div className="text-center py-16 text-on-surface-variant">Consultation not found.</div>;
  const workflowPack = getWorkflowPackByTemplateKey(activeTemplateKey);
  const currentNote = Array.isArray(consultation.clinical_note)
    ? consultation.clinical_note[consultation.clinical_note.length - 1]
    : consultation.clinical_note;
  const patientSummary =
    currentNote?.patient_summary_snapshot &&
    Object.keys(currentNote.patient_summary_snapshot).length > 0
      ? currentNote.patient_summary_snapshot
      : null;

  const discrepancyCount = qaFindings.filter((f) => f.code.startsWith('chart_discrepancy_')).length;

  const panelTabs = [
    { id: 'safety', label: 'Safety', icon: ShieldCheck, count: qaFindings.filter((f) => f.severity !== 'info' && !resolvedFindings.has(f.code)).length },
    { id: 'provenance', label: 'Provenance', icon: Waypoints, count: provenance.filter((p) => p.source === 'needs_review').length },
    { id: 'discrepancies', label: 'Conflicts', icon: ArrowLeftRight, count: discrepancyCount },
    { id: 'evidence', label: 'Evidence', icon: BookOpen, count: 0 },
    { id: 'summary', label: 'Summary', icon: FileText, count: 0 },
  ];

  function handleResolveQA(finding: QAFinding) {
    setResolvedFindings((prev) => new Set(prev).add(finding.code));
  }

  function handleDismissQA(finding: QAFinding) {
    setResolvedFindings((prev) => new Set(prev).add(finding.code));
  }

  function handleEditSection(section: string) {
    const sectionKey = section as keyof SOAPNote;
    if (!['subjective', 'objective', 'assessment', 'plan'].includes(section)) return;
    setEditingSection(sectionKey);
    setTimeout(() => {
      document.getElementById(`soap-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Clear after SOAPSection picks it up
      setTimeout(() => setEditingSection(null), 200);
    }, 50);
  }

  async function handleRerunQA() {
    if (!noteId) return;
    setIsRechecking(true);
    try {
      const result = await runVerificationArtifacts(
        noteId, content, confidence, medications, followUpTasks, referrals
      );
      // Auto-resolve findings that no longer appear
      const newCodes = new Set(result.qaFindings.map((f) => f.code));
      setResolvedFindings((prev) => {
        const next = new Set(prev);
        for (const code of prev) {
          if (!newCodes.has(code)) next.delete(code);
        }
        return next;
      });
      setContentEdited(false);
      addToast('Safety check updated', 'success');
    } catch {
      addToast('Failed to re-check safety', 'error');
    } finally {
      setIsRechecking(false);
    }
  }

  return (
    <div>
      <BreadcrumbNav items={[
        { label: 'Consultations', href: '/consultations' },
        { label: consultation.patient ? `${consultation.patient.first_name} ${consultation.patient.last_name}` : 'Consultation', href: `/consultations/${id}` },
        { label: 'Review' },
      ]} />
      <PageHeader title="Review Clinical Note" className="mt-4" />

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary-fixed/10 to-transparent animate-shimmer bg-[length:200%_100%] pointer-events-none" />

            <div className="relative flex items-center gap-4">
              {/* Animated icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/10 shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-6 h-6 text-secondary" />
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">
                  Generating clinical note with AI
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Analysing transcript and structuring SOAP sections...
                </p>
                <div className="mt-3">
                  <ProgressBar value={50} color="secondary" />
                </div>
              </div>
            </div>

            {/* Animated section labels */}
            <div className="relative flex gap-2 mt-4 pt-4 border-t border-outline-variant/20">
              {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section, i) => (
                <motion.div
                  key={section}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                  className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-xs font-medium text-on-surface-variant">{section}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {(content.subjective || content.objective || content.assessment || content.plan) && (
        <>
          {/* QA Scorecard + Workflow stepper — always visible at top */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <QAScorecard findings={qaFindings} />
            {consultation && <WorkflowProgress status={consultation.status} />}
          </div>

          {/* Template + workflow pack context */}
          <Card className="mb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface">Template</p>
                <p className="mt-1 text-sm text-on-surface-variant">{selectedTemplate.name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{selectedTemplate.category.split('_').join(' ')}</Badge>
                {selectedTemplate.specialty ? <Badge variant="info">{selectedTemplate.specialty}</Badge> : null}
                {workflowPack ? <Badge variant="warning">{workflowPack.title}</Badge> : null}
              </div>
            </div>
          </Card>

          {/* Main workspace: Editor + Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            {/* Main area: Transcript + SOAP Note */}
            <div>
              <NoteEditor
                content={content}
                confidence={confidence}
                transcript={{
                  fullText: consultation.transcript?.full_text || '',
                  segments: consultation.transcript?.segments || [],
                }}
                onContentChange={handleContentChange}
                readOnly={isApproved}
                provenance={provenance}
                editingSection={editingSection}
              />

              {/* Medications, follow-up, referrals below editor */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                <MedicationDraftSection medications={medications} onVerify={handleVerifyMed} />
                <FollowUpTasksSection tasks={followUpTasks} onToggle={handleToggleTask} />
                <ReferralDraftSection referrals={referrals} />
              </div>
            </div>

            {/* Right sidebar: tabbed verification panels */}
            <div className="xl:sticky xl:top-[calc(var(--header-height)+1rem)] xl:self-start xl:max-h-[calc(100vh-var(--header-height)-6rem)] xl:overflow-y-auto no-scrollbar rounded-xl">
              {/* Tab bar */}
              <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar pb-1">
                {panelTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activePanel === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActivePanel(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-secondary/10 text-secondary'
                          : 'text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isActive ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Panel content */}
              <div className="space-y-4">
                {activePanel === 'safety' && (
                  <QAFindingSummary
                    findings={qaFindings}
                    resolvedCodes={resolvedFindings}
                    onResolve={handleResolveQA}
                    onDismiss={handleDismissQA}
                    onEditSection={handleEditSection}
                    onRecheck={handleRerunQA}
                    isRechecking={isRechecking}
                    contentEdited={contentEdited}
                  />
                )}
                {activePanel === 'provenance' && (
                  <ProvenanceSummary provenance={provenance} />
                )}
                {activePanel === 'discrepancies' && (
                  <DiscrepancyComparison findings={qaFindings} />
                )}
                {activePanel === 'evidence' && (
                  <EvidencePanel
                    consultationId={id}
                    profileId={profile?.id}
                    note={content}
                    findings={qaFindings}
                    extraPrompts={workflowPack?.evidence_prompts}
                  />
                )}
                {activePanel === 'summary' && (
                  <PatientSummaryCard summary={patientSummary} pending={!isApproved} />
                )}
              </div>
            </div>
          </div>

          {/* Approval bar */}
          <div className="mt-6">
            <NoteApprovalBar
              overallConfidence={confidence.overall}
              isApproved={isApproved}
              onApprove={handleApprove}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopy}
              isApproving={isApproving}
              showCelebration={showCelebration}
            />
          </div>
        </>
      )}

      {/* Fallback: no content, not generating, not loading */}
      {!isGenerating && !content.subjective && !content.objective && !content.assessment && !content.plan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-12">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 mx-auto mb-4">
              <FileText className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface">
              No clinical note yet
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant max-w-md mx-auto">
              {consultation.transcript
                ? 'A transcript is available. Generate the clinical note to begin review.'
                : 'This consultation does not have a transcript yet. Go back and record or upload audio first.'}
            </p>
            {consultation.transcript && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-semibold text-on-primary transition-shadow hover:shadow-ambient-lg"
              >
                <Sparkles className="w-4 h-4" />
                Generate Clinical Note
              </button>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
