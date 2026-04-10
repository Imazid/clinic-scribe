export type LegalDocumentSlug = 'privacy' | 'terms' | 'data-processing' | 'ai-safety';

export interface LegalDocumentSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  slug: LegalDocumentSlug;
  title: string;
  description: string;
  lastUpdated: string;
  highlights: string[];
  sections: LegalDocumentSection[];
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description:
      'How Miraa handles account information, consultation data, transcripts, and generated clinical outputs.',
    lastUpdated: 'April 5, 2026',
    highlights: [
      'Only the minimum account, clinic, and consultation data needed to operate the service is collected.',
      'Protected health information is processed to generate transcripts, notes, closeout material, and related workflow outputs.',
      'Access to clinic data should remain limited to authorised users within the clinic workspace.',
    ],
    sections: [
      {
        heading: 'Information collected',
        paragraphs: [
          'Miraa may collect account details such as clinician name, email address, clinic identity, role, and subscription metadata. It also processes consultation records, audio recordings, transcripts, note drafts, generated documents, and workflow activity created within the product.',
          'Where a clinic chooses to upload or dictate clinical information, that information may include protected health information and other patient identifiers required to produce the requested documentation output.',
        ],
      },
      {
        heading: 'How information is used',
        paragraphs: [
          'Information is used to authenticate users, scope access to the correct clinic, generate clinical documentation, store workflow history, surface follow-up actions, and support billing, audit, reliability, and security operations.',
          'Clinical content is processed only for the purpose of delivering the documentation and workflow features requested by the clinic or clinician.',
        ],
      },
      {
        heading: 'Sharing and disclosure',
        paragraphs: [
          'Miraa should only disclose data to service providers and subprocessors required to host the product, process audio and AI workloads, store records, deliver billing functions, or comply with legal obligations.',
          'Clinic data should not be sold. Any disclosure required by law, court order, or patient safety escalation should be limited to the minimum information reasonably necessary.',
        ],
      },
      {
        heading: 'Retention and deletion',
        paragraphs: [
          'Data retention should be aligned with clinic configuration, contractual commitments, and applicable legal or regulatory requirements. Clinics remain responsible for determining whether stored records satisfy their local retention obligations.',
          'When an authorised clinic requests deletion, Miraa should delete or de-identify data unless retention is legally required for security, fraud prevention, dispute resolution, or compliance purposes.',
        ],
      },
      {
        heading: 'Your responsibilities',
        paragraphs: [
          'Each clinic is responsible for obtaining any patient consent, notice, or lawful basis required to capture, upload, or process consultation content through the service.',
          'Users must keep credentials secure, restrict access to authorised staff, and avoid storing information in the service that the clinic is not permitted to process.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    description:
      'The product rules for account use, acceptable behaviour, subscriptions, and clinical review obligations.',
    lastUpdated: 'April 5, 2026',
    highlights: [
      'Miraa provides draft workflow output and does not replace clinician judgement or final review.',
      'Each clinic is responsible for account security, local regulatory compliance, and appropriate patient consent.',
      'Subscriptions, seats, and feature access may vary by plan and can be suspended for misuse or non-payment.',
    ],
    sections: [
      {
        heading: 'Service scope',
        paragraphs: [
          'Miraa provides software tools that assist with preparation, live capture, transcription, note generation, verification, tasks, templates, and related clinical workflow output.',
          'The service is provided as a clinical workflow support product. It does not independently diagnose, prescribe, or assume responsibility for final patient care decisions.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: [
          'Users must not upload unlawful material, attempt unauthorised access, interfere with other tenants, reverse engineer protected services, or use the platform in a way that violates law, professional duties, or third-party rights.',
          'Generated output must be reviewed by a qualified human before it is relied on, shared externally, or committed to the medical record.',
        ],
      },
      {
        heading: 'Accounts, billing, and suspension',
        paragraphs: [
          'The subscribing clinic is responsible for its users, seat allocation, payment obligations, and any activity that occurs under its workspace. Access may be restricted or suspended for material misuse, unpaid invoices, or security risk.',
          'Feature availability, usage thresholds, and billing terms may differ by subscription tier or written agreement.',
        ],
      },
      {
        heading: 'Intellectual property and feedback',
        paragraphs: [
          'Miraa retains rights in the platform, software, design system, and service materials. The clinic retains rights in its own uploaded records and documentation content, subject to the rights needed to operate the service.',
          'If users submit feedback, bug reports, or workflow suggestions, Miraa may use that feedback to improve the product without creating a separate payment obligation.',
        ],
      },
      {
        heading: 'Disclaimers and liability',
        paragraphs: [
          'The service is provided on an as-available basis. Clinics must maintain their own professional safeguards, backup processes, and clinical review procedures.',
          'To the maximum extent allowed by law, Miraa should not be liable for indirect, incidental, or consequential loss arising from misuse, delayed review, inaccurate source material, local compliance failures, or reliance on unreviewed AI output.',
        ],
      },
    ],
  },
  {
    slug: 'data-processing',
    title: 'Data Processing & Security',
    description:
      'Operational safeguards, clinic obligations, and the way consultation content moves through the workflow.',
    lastUpdated: 'April 5, 2026',
    highlights: [
      'Clinic workspaces should remain logically separated and access-controlled.',
      'Security, audit, and retention controls should be reviewed by each clinic before rollout.',
      'Clinics remain responsible for local privacy, recordkeeping, and patient-notice requirements.',
    ],
    sections: [
      {
        heading: 'Processing roles',
        paragraphs: [
          'For most clinic workflows, the clinic acts as the controller or responsible entity for patient data entered into the service, while Miraa acts as the processor or hosted service provider delivering the requested workflow functions.',
          'If a clinic requires a separate data processing agreement, security schedule, or subprocessor review, that should be handled before production rollout.',
        ],
      },
      {
        heading: 'Security safeguards',
        paragraphs: [
          'Miraa should use role-based access, authenticated sessions, audit visibility, and managed infrastructure controls appropriate for the sensitivity of the data processed through the platform.',
          'No cloud system is risk-free. Clinics should still maintain internal device security, user offboarding, credential hygiene, and local incident response procedures.',
        ],
      },
      {
        heading: 'Incident handling',
        paragraphs: [
          'Security issues, suspected unauthorised access, and data handling concerns should be escalated promptly through the clinic’s designated support and incident contacts.',
          'Clinics are responsible for their own downstream notification duties, including regulator, partner, or patient notification obligations where required by law.',
        ],
      },
    ],
  },
  {
    slug: 'ai-safety',
    title: 'AI Clinical Safety & Medical Disclaimer',
    description:
      'How to use AI-generated drafts safely inside a clinician-reviewed documentation workflow.',
    lastUpdated: 'April 5, 2026',
    highlights: [
      'AI output may be incomplete, inaccurate, or overly confident and must be reviewed before use.',
      'The platform supports clinical documentation workflow; it does not replace clinical judgement.',
      'Clinicians remain responsible for the final chart, orders, instructions, and communications sent to patients or other providers.',
    ],
    sections: [
      {
        heading: 'Human review is mandatory',
        paragraphs: [
          'Drafts, summaries, task suggestions, and generated documents produced by Miraa are assistive outputs only. A qualified human must review them before they are filed, exported, or shared externally.',
          'Users should verify names, medications, diagnoses, referrals, timelines, and follow-up instructions against the source consultation and the patient record.',
        ],
      },
      {
        heading: 'Not medical advice',
        paragraphs: [
          'Miraa does not provide independent medical advice, diagnosis, prescribing recommendations, or clinical authorisation. It is a clinician-reviewed workflow platform designed to support preparation, documentation, and follow-up while clinicians remain responsible for the final output.',
          'If a generated statement is unsupported, ambiguous, or clinically unsafe, it should be corrected or removed before approval.',
        ],
      },
      {
        heading: 'Safe deployment expectations',
        paragraphs: [
          'Clinics should define internal review rules, staff training, escalation paths, and template governance before rolling the product out broadly.',
          'High-risk use cases, local legal requirements, and specialty-specific constraints should be reviewed by the clinic’s own compliance and clinical leadership teams.',
        ],
      },
    ],
  },
];

export function getLegalDocument(slug: LegalDocumentSlug) {
  return LEGAL_DOCUMENTS.find((document) => document.slug === slug);
}
