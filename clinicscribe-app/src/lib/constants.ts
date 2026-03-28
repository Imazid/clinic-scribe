export const APP_NAME = 'ClinicScribe AI';
export const APP_DESCRIPTION = 'AI-Powered Clinical Documentation';

export const CONSULTATION_STATUS_LABELS: Record<string, string> = {
  recording: 'Recording',
  transcribing: 'Transcribing',
  generating: 'Generating Note',
  review_pending: 'Pending Review',
  approved: 'Approved',
  exported: 'Exported',
};

export const CONSULTATION_STATUS_COLORS: Record<string, string> = {
  recording: 'bg-error/10 text-error',
  transcribing: 'bg-warning/10 text-warning',
  generating: 'bg-secondary/10 text-secondary',
  review_pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  exported: 'bg-primary/10 text-primary',
};

export const SIDEBAR_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Patients', href: '/patients', icon: 'Users' },
  { label: 'Consultations', href: '/consultations', icon: 'Stethoscope' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Integrations', href: '/integrations', icon: 'Plug' },
  { label: 'Audit Log', href: '/audit', icon: 'ClipboardList' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;

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
  'Standard Consultation',
  'Telehealth',
  'Follow-up',
  'Procedure',
  'Mental Health',
  'Chronic Disease Management',
  'Health Assessment',
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
  promptVersion: '1.0.0',
} as const;

export const CONFIDENCE_THRESHOLDS = {
  high: 0.9,
  medium: 0.7,
} as const;
