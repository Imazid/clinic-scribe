import type { WorkflowPack } from '@/lib/types';

export const WORKFLOW_PACKS: WorkflowPack[] = [
  {
    key: 'gp-core',
    title: 'GP Core Pack',
    specialty: 'General Practice',
    description:
      'Primary care workflow pack for routine consults, medication review, safety-netting, and tracked follow-up.',
    template_keys: [
      'soap-note',
      'soap-note-including-issues',
      'history-and-physical',
      'history-and-physical-including-issues',
      'issues-list',
      'letter-to-referring-practitioner',
      'medical-certificate',
      'patient-explainer-letter',
    ],
    prep_focus: [
      'Review the last visit summary and any unresolved problem-list items.',
      'Confirm active medicines, allergies, and any recent medication changes.',
      'Check open referrals, recalls, and repeat-test tasks before the consult starts.',
    ],
    verify_checklist: [
      'Confirm the assessment is supported by the transcript and chart history.',
      'Verify medications, allergy documentation, and explicit follow-up intervals.',
      'Make sure the plan converts into recalls, result checks, or referrals where needed.',
    ],
    closeout_focus: [
      'Generate plain-English patient instructions before closing the consult.',
      'Turn plan items into recalls, monitoring tasks, and referral follow-up.',
      'Send or print the correct summary, certificate, or referral draft.',
    ],
    evidence_prompts: [
      {
        id: 'gp-medication-safety',
        label: 'Medication safety',
        question:
          'What medication safety and reconciliation checks should a GP confirm before closing this consult?',
        scope: 'chart_reconciliation',
      },
      {
        id: 'gp-safety-netting',
        label: 'Safety-netting',
        question:
          'What should the clinician include in patient instructions about red flags, when to seek urgent care, and follow-up timing for this GP consult?',
        scope: 'patient_instructions',
      },
    ],
  },
  {
    key: 'nephrology-follow-up',
    title: 'Nephrology Follow-up Pack',
    specialty: 'Nephrology',
    description:
      'Renal follow-up pack focused on CKD trajectory, result review, medication safety, and monitoring cadence.',
    template_keys: [
      'ckd-clinic-letter',
      'nephrology-consultation',
      'nephrology-note',
      'nephrology-outpatient-clinic-letter-follow-up',
      'pediatric-nephrology-clinic',
      'renal-review-note',
    ],
    prep_focus: [
      'Check the latest renal trajectory, abnormal results, and pending monitoring tasks.',
      'Review antihypertensives, diuretics, and nephrology medication changes from prior notes.',
      'Clarify outstanding referrals, imaging, and blood or urine tests due for follow-up.',
    ],
    verify_checklist: [
      'Confirm the note captures renal function trends, BP context, and medication changes accurately.',
      'Look for dose conflicts, missing repeat-test intervals, and unsupported renal risk statements.',
      'Make sure the follow-up plan includes monitoring cadence, referral status, and escalation advice.',
    ],
    closeout_focus: [
      'Generate result reminders for repeat renal function and urine testing.',
      'Prepare referral or clinic letters with the current trajectory and monitoring plan.',
      'Ensure patient instructions explain red flags such as fluid overload, reduced urine output, or worsening symptoms.',
    ],
    evidence_prompts: [
      {
        id: 'renal-monitoring',
        label: 'Renal monitoring',
        question:
          'What monitoring intervals and result follow-up points should the clinician confirm for this nephrology consult?',
        scope: 'follow_up',
      },
      {
        id: 'renal-patient-instructions',
        label: 'Renal patient advice',
        question:
          'What should the patient instructions emphasise for CKD monitoring, medication safety, and red flags after this nephrology visit?',
        scope: 'patient_instructions',
      },
    ],
  },
];

export function getWorkflowPackByTemplateKey(templateKey?: string | null) {
  if (!templateKey) {
    return null;
  }

  return (
    WORKFLOW_PACKS.find((pack) => pack.template_keys.includes(templateKey)) ?? null
  );
}
