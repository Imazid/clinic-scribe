export const APP_NAME = 'Miraa';
export const APP_EXPANDED_NAME = 'Medical Insights, Record, Automation and Assistance';
export const APP_DESCRIPTION = `${APP_NAME} (${APP_EXPANDED_NAME}) is the clinical workflow copilot that prepares the visit, captures it, verifies it, and closes the loop.`;

export const CONSULTATION_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  brief_ready: 'Brief Ready',
  recording: 'Recording',
  transcribing: 'Transcribing',
  generating: 'Generating Note',
  review_pending: 'Pending Review',
  approved: 'Approved',
  closeout_pending: 'Closeout Pending',
  closed: 'Closed',
  exported: 'Exported',
};

export const CONSULTATION_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-primary/10 text-primary',
  brief_ready: 'bg-secondary/10 text-secondary',
  recording: 'bg-error/10 text-error',
  transcribing: 'bg-warning/10 text-warning',
  generating: 'bg-secondary/10 text-secondary',
  review_pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  closeout_pending: 'bg-primary/10 text-primary',
  closed: 'bg-success/10 text-success',
  exported: 'bg-primary/10 text-primary',
};

export const WORKFLOW_NAV = [
  { label: 'Prepare', href: '/prepare', icon: 'ClipboardList' },
  { label: 'Capture', href: '/capture', icon: 'Mic' },
  { label: 'Verify', href: '/verify', icon: 'ShieldCheck' },
  { label: 'Close', href: '/close', icon: 'ListChecks' },
] as const;

export const SECONDARY_NAV = [
  { label: 'Tasks', href: '/tasks', icon: 'ListTodo' },
  { label: 'My Templates', href: '/templates', icon: 'LayoutTemplate' },
  { label: 'Patients', href: '/patients', icon: 'Users' },
  { label: 'Prescriptions', href: '/prescriptions', icon: 'Pill', badge: 'Soon' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Integrations', href: '/integrations', icon: 'Plug' },
  { label: 'Audit Log', href: '/audit', icon: 'FileClock' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;

export const SIDEBAR_NAV = [...WORKFLOW_NAV, ...SECONDARY_NAV] as const;

export const PATIENT_SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
] as const;

export const CONSENT_STATUS_LABELS: Record<string, string> = {
  granted: 'Consent Granted',
  revoked: 'Consent Revoked',
  pending: 'Consent Pending',
};

export const NOTE_FORMAT_OPTIONS = [
  { label: 'SOAP Note', value: 'soap' },
  { label: 'Progress Note', value: 'progress' },
  { label: 'Visit Summary', value: 'visit_summary' },
] as const;

export const CONSULTATION_TYPE_OPTIONS = [
  { label: 'Standard Consultation', value: 'Standard Consultation', icon: 'Stethoscope' },
  { label: 'Telehealth', value: 'Telehealth', icon: 'Video' },
  { label: 'Follow-up', value: 'Follow-up', icon: 'RotateCcw' },
  { label: 'Procedure', value: 'Procedure', icon: 'Syringe' },
  { label: 'Mental Health', value: 'Mental Health', icon: 'Brain' },
  { label: 'Chronic Disease Management', value: 'Chronic Disease Management', icon: 'HeartPulse' },
  { label: 'Health Assessment', value: 'Health Assessment', icon: 'ClipboardCheck' },
] as const;

export const AUDIO_CONSTRAINTS = {
  maxFileSizeMB: 24,
  sampleRate: 16000,
  channels: 1,
  mimeType: 'audio/webm;codecs=opus',
  bitRate: 64000,
} as const;

export const AI_CONFIG = {
  whisperModel: 'whisper-1',
  noteModel: 'gpt-4o',
  promptVersion: '1.1.0',
} as const;

export const CONFIDENCE_THRESHOLDS = {
  high: 0.9,
  medium: 0.7,
} as const;

export const VERIFICATION_SEVERITY_LABELS = {
  info: 'Info',
  warning: 'Needs Review',
  critical: 'Critical',
} as const;

export const CARE_TASK_STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export const CARE_TASK_CATEGORY_LABELS = {
  follow_up: 'Follow-up',
  result_check: 'Result Check',
  referral: 'Referral',
  medication_review: 'Medication Review',
  patient_education: 'Patient Education',
} as const;

export const CARE_TASK_SOURCE_LABELS = {
  note_plan: 'AI note',
  referral_draft: 'Referral draft',
  manual: 'Manual task',
} as const;

export const GENERATED_DOCUMENT_KIND_LABELS = {
  patient_summary: 'Internal summary',
  patient_instructions: 'Patient instructions',
  patient_family_email: 'Patient & family email',
  referral_letter: 'Referral letter',
  result_reminder: 'Result reminder',
  follow_up_letter: 'Follow-up letter',
  work_certificate: 'Work certificate',
  medical_certificate: 'Medical certificate',
  care_plan: 'Care plan',
  visit_summary: 'Visit summary',
} as const;

export const GENERATED_DOCUMENT_STATUS_LABELS = {
  draft: 'Draft',
  ready: 'Ready',
  sent: 'Sent',
} as const;

export const DOCUMENT_CHANNEL_LABELS = {
  print: 'Print',
  sms: 'SMS',
  email: 'Email',
} as const;

export const EVIDENCE_SCOPE_LABELS = {
  qa_resolution: 'QA Resolution',
  chart_reconciliation: 'Chart Reconciliation',
  follow_up: 'Follow-up',
  patient_instructions: 'Patient Instructions',
} as const;
