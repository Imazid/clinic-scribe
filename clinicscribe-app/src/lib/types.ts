export type ConsultationStatus =
  | 'scheduled'
  | 'brief_ready'
  | 'recording'
  | 'transcribing'
  | 'generating'
  | 'review_pending'
  | 'approved'
  | 'closeout_pending'
  | 'closed'
  | 'exported';

export type UserRole = 'admin' | 'clinician' | 'receptionist';

export type SubscriptionTier = 'solo' | 'clinic' | 'group' | 'enterprise';

export type ConsentStatus = 'granted' | 'revoked' | 'pending';

export type NoteFormat = 'soap' | 'progress' | 'visit_summary';

export type ExportFormat = 'pdf' | 'clipboard';

export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export type TemplateCategory =
  | 'clinical_note'
  | 'clinic_letter'
  | 'referral_letter'
  | 'patient_communication'
  | 'meeting_note'
  | 'certificate'
  | 'form'
  | 'care_planning';

export type TemplateOutputKind =
  | 'note'
  | 'letter'
  | 'meeting'
  | 'certificate'
  | 'form'
  | 'patient_summary'
  | 'goals';

export type BriefStatus = 'draft' | 'ready' | 'stale';

export type ProvenanceSource =
  | 'transcript'
  | 'chart'
  | 'imported_result'
  | 'inferred'
  | 'needs_review';

export type VerificationStatus = 'pending' | 'ready' | 'qa_flagged' | 'approved';

export type QAFindingSeverity = 'info' | 'warning' | 'critical';

export type CareTaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type CareTaskCategory =
  | 'follow_up'
  | 'result_check'
  | 'referral'
  | 'medication_review'
  | 'patient_education';

export type GeneratedDocumentKind =
  | 'patient_summary'
  | 'patient_instructions'
  | 'patient_family_email'
  | 'referral_letter'
  | 'result_reminder'
  | 'follow_up_letter'
  | 'work_certificate'
  | 'medical_certificate'
  | 'care_plan'
  | 'visit_summary';

export type EvidenceQueryScope =
  | 'qa_resolution'
  | 'chart_reconciliation'
  | 'follow_up'
  | 'patient_instructions';

export type PrescriptionStatus =
  | 'draft'
  | 'approved'
  | 'printed'
  | 'dispensed'
  | 'void';

export interface PrescriptionItem {
  name: string;
  strength: string | null;
  form: string | null;
  dose: string;
  frequency: string;
  duration: string | null;
  quantity: number | null;
  repeats: number | null;
  instructions: string | null;
}

export interface Prescription {
  id: string;
  clinic_id: string;
  patient_id: string;
  consultation_id: string | null;
  clinical_note_id: string | null;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  notes: string | null;
  drafted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  consultation?: Consultation;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string;
  subscription_seats: number;
  subscription_period_end: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  clinic_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  specialty: string | null;
  provider_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: 'male' | 'female' | 'other';
  email: string | null;
  phone: string | null;
  mrn: string | null;
  medicare_number: string | null;
  ihi: string | null;
  allergies: string[];
  conditions: string[];
  consent_status: ConsentStatus;
  consent_date: string | null;
  notes: string | null;
  height_cm: number | null;
  provider_name: string | null;
  location: string | null;
  last_appointment_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  clinic_id: string;
  patient_id: string;
  clinician_id: string;
  status: ConsultationStatus;
  consultation_type: string;
  template_key: string | null;
  scheduled_for: string | null;
  reason_for_visit: string;
  source: string;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  clinician?: Profile;
  audio_recording?: AudioRecording;
  transcript?: Transcript;
  clinical_note?: ClinicalNote;
  visit_brief?: VisitBrief | null;
  care_tasks?: CareTask[];
  generated_documents?: GeneratedDocument[];
}

export interface AudioRecording {
  id: string;
  consultation_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  duration_seconds: number;
  mime_type: string;
  created_at: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker: string | null;
}

export interface Transcript {
  id: string;
  consultation_id: string;
  full_text: string;
  segments: TranscriptSegment[];
  language: string;
  model: string;
  created_at: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface ConfidenceScores {
  subjective: number;
  objective: number;
  assessment: number;
  plan: number;
  overall: number;
}

export interface MedicationDraft {
  name: string;
  dose: string;
  frequency: string;
  quantity: string;
  verified: boolean;
}

export interface FollowUpTask {
  description: string;
  due_date: string | null;
  completed: boolean;
}

export interface NoteProvenanceItem {
  section: keyof SOAPNote;
  sentence: string;
  source: ProvenanceSource;
  rationale: string;
  confidence: number;
}

export interface QAFinding {
  code: string;
  title: string;
  detail: string;
  severity: QAFindingSeverity;
  section?: keyof SOAPNote | 'medications' | 'follow_up' | 'overall';
  suggested_fix?: string;
}

export interface TemplateSectionDefinition {
  key: string;
  title: string;
  guidance: string;
  required: boolean;
  maps_to: keyof SOAPNote | 'document';
}

export interface TemplateCatalogItem {
  key: string;
  name: string;
  category: TemplateCategory;
  output_kind: TemplateOutputKind;
  specialty: string | null;
  description: string;
  prompt_instructions: string;
  format: NoteFormat;
  sections: string[];
  structure: TemplateSectionDefinition[];
  tags: string[];
  sort_order: number;
  is_default?: boolean;
}

export interface WorkflowPackPrompt {
  id: string;
  label: string;
  question: string;
  scope: EvidenceQueryScope;
}

export interface WorkflowPack {
  key: string;
  title: string;
  specialty: string;
  description: string;
  template_keys: string[];
  prep_focus: string[];
  verify_checklist: string[];
  closeout_focus: string[];
  evidence_prompts: WorkflowPackPrompt[];
}

export interface PatientSummary {
  heading: string;
  plain_language_summary: string;
  key_points: string[];
  medication_changes: string[];
  next_steps: string[];
  seek_help: string[];
  language: string;
  reading_level: string;
}

export interface EvidenceCitation {
  id: string;
  title: string;
  organisation: string;
  url: string;
  topic: string;
  summary: string;
}

export interface EvidenceAnswer {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  consultation_id: string;
  question: string;
  scope: EvidenceQueryScope;
  linked_finding_code: string | null;
  answer: string;
  key_points: string[];
  citations: EvidenceCitation[];
  status: 'draft' | 'accepted';
  created_by: string | null;
  accepted_by: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalNote {
  id: string;
  consultation_id: string;
  version: number;
  format: NoteFormat;
  template_key: string | null;
  content: SOAPNote;
  confidence_scores: ConfidenceScores;
  medications: MedicationDraft[];
  follow_up_tasks: FollowUpTask[];
  referrals: string[];
  provenance_map: NoteProvenanceItem[];
  qa_findings: QAFinding[];
  verification_status: VerificationStatus;
  patient_summary_snapshot: PatientSummary;
  ai_model: string;
  ai_prompt_version: string;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  clinic_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
}

export interface NoteTemplate {
  id: string;
  key: string;
  clinic_id: string | null;
  name: string;
  format: NoteFormat;
  category: TemplateCategory;
  output_kind: TemplateOutputKind;
  specialty: string | null;
  description: string | null;
  prompt_instructions: string | null;
  system_prompt_override: string | null;
  sections: string[];
  structure: TemplateSectionDefinition[];
  tags: string[];
  sort_order: number;
  is_default: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateVersion {
  id: string;
  note_template_id: string;
  version: number;
  name: string;
  config: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface ExportRecord {
  id: string;
  consultation_id: string;
  note_id: string;
  format: ExportFormat;
  file_path: string | null;
  exported_by: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalPatients: number;
  consultationsThisWeek: number;
  avgDocumentationTimeSeconds: number;
  pendingReviews: number;
}

export interface VisitBrief {
  id: string;
  clinic_id: string;
  patient_id: string;
  consultation_id: string;
  status: BriefStatus;
  summary: string;
  active_problems: string[];
  medication_changes: string[];
  abnormal_results: string[];
  unresolved_items: string[];
  likely_agenda: string[];
  clarification_questions: string[];
  source_context: Record<string, unknown>;
  created_by?: string | null;
  updated_by?: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
  consultation?: Consultation;
  patient?: Patient;
}

export interface CareTask {
  id: string;
  clinic_id: string;
  patient_id: string;
  consultation_id: string;
  note_id: string | null;
  title: string;
  description: string;
  due_at: string | null;
  status: CareTaskStatus;
  category: CareTaskCategory;
  owner_user_id: string | null;
  source: string;
  metadata: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  consultation?: Consultation;
}

export interface GeneratedDocument {
  id: string;
  clinic_id: string;
  patient_id: string;
  consultation_id: string;
  note_id: string | null;
  kind: GeneratedDocumentKind;
  title: string;
  status: 'draft' | 'ready' | 'sent';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  consultation?: Consultation;
}

export interface TimelineEvent {
  id: string;
  clinic_id: string;
  patient_id: string;
  consultation_id: string | null;
  event_type: string;
  title: string;
  summary: string;
  event_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
