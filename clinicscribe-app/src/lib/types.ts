export type ConsultationStatus =
  | 'recording'
  | 'transcribing'
  | 'generating'
  | 'review_pending'
  | 'approved'
  | 'exported';

export type UserRole = 'admin' | 'clinician' | 'receptionist';

export type SubscriptionTier = 'solo' | 'clinic' | 'group' | 'enterprise';

export type ConsentStatus = 'granted' | 'revoked' | 'pending';

export type NoteFormat = 'soap' | 'progress' | 'visit_summary';

export type ExportFormat = 'pdf' | 'clipboard';

export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

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

export interface ClinicalNote {
  id: string;
  consultation_id: string;
  version: number;
  format: NoteFormat;
  content: SOAPNote;
  confidence_scores: ConfidenceScores;
  medications: MedicationDraft[];
  follow_up_tasks: FollowUpTask[];
  referrals: string[];
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
  clinic_id: string;
  name: string;
  format: NoteFormat;
  system_prompt_override: string | null;
  sections: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
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
