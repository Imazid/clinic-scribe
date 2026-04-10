import type { EvidenceCitation, EvidenceQueryScope, Patient, QAFinding } from '@/lib/types';

interface EvidenceSource extends EvidenceCitation {
  keywords: string[];
  scopes: EvidenceQueryScope[];
}

const EVIDENCE_LIBRARY: EvidenceSource[] = [
  {
    id: 'acsqhc-medication-reconciliation',
    title: 'Resources for obtaining a best possible medication history',
    organisation: 'Australian Commission on Safety and Quality in Health Care',
    url: 'https://www.safetyandquality.gov.au/our-work/medicines-safety-and-quality/medication-reconciliation/resources-obtaining-best-possible-medication-history',
    topic: 'Medication reconciliation',
    summary:
      'Medication reconciliation starts with an accurate best possible medication history and should use more than one information source to reduce discrepancies and improve medication safety.',
    keywords: [
      'medication',
      'dose',
      'reconciliation',
      'allergy',
      'medicine',
      'drug',
      'bp medication',
    ],
    scopes: ['qa_resolution', 'chart_reconciliation', 'patient_instructions'],
  },
  {
    id: 'kidney-health-ckd-primary-care',
    title: 'Chronic Kidney Disease Management in Primary Care handbook',
    organisation: 'Kidney Health Australia',
    url: 'https://kidney.org.au/health-professionals/',
    topic: 'CKD management',
    summary:
      'Kidney Health Australia provides primary-care guidance on detecting, monitoring, managing, and referring chronic kidney disease, including risk stratification and when to escalate care.',
    keywords: [
      'ckd',
      'chronic kidney disease',
      'kidney',
      'renal',
      'egfr',
      'creatinine',
      'albumin',
      'proteinuria',
      'referral',
    ],
    scopes: ['qa_resolution', 'chart_reconciliation', 'follow_up'],
  },
  {
    id: 'heart-foundation-cvd-risk',
    title: '2023 Guideline for assessing and managing CVD risk',
    organisation: 'Heart Foundation',
    url: 'https://www.heartfoundation.org.au/for-professionals/guideline-for-managing-cvd',
    topic: 'Cardiovascular risk',
    summary:
      'The Heart Foundation guideline supports cardiovascular risk assessment, communication, and management, and reinforces linking treatment decisions to overall risk and review intervals.',
    keywords: [
      'cardiovascular',
      'cvd',
      'cholesterol',
      'lipid',
      'risk',
      'hypertension',
      'blood pressure',
      'review interval',
    ],
    scopes: ['qa_resolution', 'follow_up'],
  },
  {
    id: 'healthdirect-blood-pressure-medicines',
    title: 'Blood pressure medicines',
    organisation: 'Healthdirect Australia',
    url: 'https://www.healthdirect.gov.au/blood-pressure-medicines',
    topic: 'Hypertension medicines',
    summary:
      'Blood pressure medicines should be reviewed regularly, and treatment plans often involve dose titration, medicine classes, and follow-up review to balance benefit and risk.',
    keywords: [
      'blood pressure',
      'hypertension',
      'antihypertensive',
      'ace inhibitor',
      'arb',
      'dose',
      'review',
    ],
    scopes: ['qa_resolution', 'chart_reconciliation', 'patient_instructions', 'follow_up'],
  },
  {
    id: 'healthdirect-chronic-kidney-disease',
    title: 'Chronic kidney disease (CKD)',
    organisation: 'Healthdirect Australia',
    url: 'https://www.healthdirect.gov.au/chronic-kidney-disease',
    topic: 'CKD patient information',
    summary:
      'Healthdirect outlines CKD symptoms, tests, treatment goals, and red flags, and emphasises early diagnosis, regular review, and medicine safety in kidney disease.',
    keywords: [
      'ckd',
      'kidney',
      'renal',
      'swelling',
      'fluid',
      'urine',
      'patient instructions',
      'red flag',
    ],
    scopes: ['patient_instructions', 'follow_up', 'qa_resolution'],
  },
  {
    id: 'healthdirect-cmi',
    title: 'How to read Consumer Medicine Information (CMI)',
    organisation: 'Healthdirect Australia',
    url: 'https://www.healthdirect.gov.au/how-to-read-cmis',
    topic: 'Consumer medicine information',
    summary:
      'Consumer Medicine Information helps patients understand how to take medicines safely, common warnings, interactions, and when to seek help or ask a pharmacist or doctor.',
    keywords: [
      'medicine',
      'instructions',
      'patient instructions',
      'side effect',
      'interaction',
      'consumer medicine information',
    ],
    scopes: ['patient_instructions', 'follow_up'],
  },
];

function normalize(text: string) {
  return text.toLowerCase();
}

export function selectEvidenceSources(params: {
  question: string;
  scope: EvidenceQueryScope;
  finding?: QAFinding | null;
  patient?: Patient | null;
}) {
  const { question, scope, finding, patient } = params;
  const haystack = normalize(
    [
      question,
      finding?.title || '',
      finding?.detail || '',
      ...(patient?.conditions || []),
      ...(patient?.allergies || []),
    ].join(' ')
  );

  const scored = EVIDENCE_LIBRARY.map((source) => {
    const score =
      (source.scopes.includes(scope) ? 2 : 0) +
      source.keywords.filter((keyword) => haystack.includes(keyword)).length;

    return { source, score };
  })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  const selected = scored.slice(0, 3).map((item) => item.source);

  if (selected.length > 0) return selected;

  return EVIDENCE_LIBRARY.filter((source) => source.scopes.includes(scope)).slice(0, 2);
}

export function getEvidenceSourceById(id: string) {
  return EVIDENCE_LIBRARY.find((source) => source.id === id) || null;
}
