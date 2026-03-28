// ============================================================
// BRAND — Change these to rebrand the entire site
// ============================================================
export const BRAND = {
  name: "ClinicScribe AI",
  shortName: "ClinicScribe",
  tagline: "AI-Powered Clinical Documentation",
  description: "The ambient clinical scribe that drafts structured notes, referrals, and follow-up actions — so clinicians can focus on patients, not paperwork.",
  url: "https://clinicscribe.ai",
  supportEmail: "hello@clinicscribe.ai",
  demoEmail: "demo@clinicscribe.ai",
  phone: "+61 2 0000 0000",
  location: "Sydney, Australia",
  founded: "2024",
} as const;

// ============================================================
// NAVIGATION
// ============================================================
export const NAV_ITEMS = [
  {
    label: "Product",
    href: "/product",
    children: [
      { label: "How It Works", href: "/product", description: "End-to-end clinical documentation workflow" },
      { label: "Integrations", href: "/integrations", description: "Connect with your existing clinical systems" },
      { label: "Use Cases", href: "/use-cases", description: "Solutions for every practice type" },
    ],
  },
  {
    label: "Safety",
    href: "/safety",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Company",
    href: "/about",
    children: [
      { label: "About", href: "/about", description: "Our mission and team" },
      { label: "Blog", href: "/blog", description: "Insights and updates" },
      { label: "FAQ", href: "/faq", description: "Common questions answered" },
    ],
  },
] as const;

// ============================================================
// FEATURES
// ============================================================
export const FEATURES = [
  {
    icon: "Mic",
    title: "Ambient Transcription",
    description: "Capture patient-clinician conversations in real time or upload recorded audio. Speaker diarisation separates voices with clinical-grade accuracy.",
    tag: "Core",
  },
  {
    icon: "FileText",
    title: "Structured Clinical Notes",
    description: "AI drafts SOAP notes, progress notes, and visit summaries using recognised medical terminology. Every output is structured and ready for clinician review.",
    tag: "Core",
  },
  {
    icon: "Send",
    title: "Referral Draft Generation",
    description: "Automatically draft referral letters from consultation context. Clinicians review, edit, and approve before sending — nothing leaves without sign-off.",
    tag: "Workflow",
  },
  {
    icon: "Receipt",
    title: "Billing & Coding Support",
    description: "Suggest appropriate MBS item numbers and coding based on consultation content. Designed to support — not replace — clinical coding decisions.",
    tag: "Workflow",
  },
  {
    icon: "ListChecks",
    title: "Follow-up Task Capture",
    description: "Identify and surface follow-up actions from consultations: pathology requests, specialist referrals, recall reminders, and patient instructions.",
    tag: "Workflow",
  },
  {
    icon: "Pill",
    title: "Prescription Drafting Assist",
    description: "Pre-populate prescription details from consultation context. The clinician must review, validate, and approve every prescription before it is finalised.",
    tag: "Assist",
  },
  {
    icon: "ShieldCheck",
    title: "Audit Logs & Traceability",
    description: "Every AI-generated output is logged with timestamps, confidence scores, clinician actions, and edit history. Full traceability for compliance and quality.",
    tag: "Safety",
  },
  {
    icon: "Lock",
    title: "Privacy & Consent",
    description: "Patient consent workflows built in. Data encrypted in transit and at rest. Designed for Australian healthcare privacy requirements from day one.",
    tag: "Safety",
  },
] as const;

// ============================================================
// WORKFLOW STEPS
// ============================================================
export const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Record or Listen",
    description: "Start ambient listening during a consultation, or upload a recorded session. Multi-speaker detection identifies clinician and patient.",
    icon: "Mic",
  },
  {
    step: 2,
    title: "Transcribe",
    description: "Medical-grade speech recognition transcribes the conversation with clinical terminology awareness and speaker labels.",
    icon: "FileAudio",
  },
  {
    step: 3,
    title: "Draft Structured Note",
    description: "AI generates a structured clinical note — SOAP format, progress note, or visit summary — from the transcript content.",
    icon: "FileText",
  },
  {
    step: 4,
    title: "Clinician Review",
    description: "The clinician reviews, edits, and approves the draft. Confidence indicators highlight areas that may need attention. Nothing is saved without approval.",
    icon: "UserCheck",
  },
  {
    step: 5,
    title: "Export to System",
    description: "Approved notes are exported to your clinical software — Best Practice, MedicalDirector, or via FHIR-compatible formats.",
    icon: "Upload",
  },
  {
    step: 6,
    title: "Trigger Follow-ups",
    description: "Follow-up tasks, referral drafts, and recall reminders are queued for clinician review. Prescription drafts are pre-populated for validation.",
    icon: "CheckCircle",
  },
] as const;

// ============================================================
// INTEGRATIONS
// ============================================================
export type IntegrationStatus = "available" | "pilot" | "planned";

export interface Integration {
  name: string;
  description: string;
  status: IntegrationStatus;
  category: string;
}

export const INTEGRATIONS: Integration[] = [
  { name: "Best Practice", description: "Direct integration with Australia's most popular GP clinical software", status: "pilot", category: "Clinical Software" },
  { name: "MedicalDirector", description: "Seamless note export and patient record synchronisation", status: "pilot", category: "Clinical Software" },
  { name: "Genie Solutions", description: "FHIR-based integration with Australia's leading specialist practice management software. Pull patient demographics, appointments, and clinical data. Push approved notes and referral letters directly into Genie's correspondence.", status: "pilot", category: "Clinical Software" },
  { name: "Zedmed", description: "Clinical data export for Zedmed users", status: "planned", category: "Clinical Software" },
  { name: "Telehealth Platforms", description: "Audio capture from major Australian telehealth providers", status: "pilot", category: "Telehealth" },
  { name: "Coviu", description: "Integration with Coviu telehealth sessions", status: "planned", category: "Telehealth" },
  { name: "FHIR R4", description: "Standards-based interoperability for EHR/EMR systems", status: "planned", category: "Standards" },
  { name: "HL7 v2", description: "Legacy health system messaging support", status: "planned", category: "Standards" },
  { name: "eRx Script Exchange", description: "Prescription draft pre-population for clinician-approved scripts", status: "planned", category: "Prescribing" },
  { name: "Medicare Online", description: "Billing code suggestions for MBS items", status: "planned", category: "Billing" },
];

// ============================================================
// GENIE SOLUTIONS INTEGRATION
// ============================================================
export const GENIE_INTEGRATION = {
  name: "Genie Solutions",
  provider: "Magentus",
  description:
    "Deep integration with Australia's leading specialist practice management software, powered by FHIR-standard APIs.",
  status: "pilot" as IntegrationStatus,
  reach: {
    practices: "2,000+",
    practitioners: "13,500+",
    patients: "14M+",
    specialties: "55+",
  },
  capabilities: {
    pull: [
      {
        resource: "Patient Demographics",
        fhirType: "Patient",
        description:
          "Retrieve patient names, contact details, identifiers, and demographic data to pre-populate consultation context.",
      },
      {
        resource: "Appointments",
        fhirType: "Appointment",
        description:
          "Access today's appointment schedule, upcoming bookings, and practitioner availability.",
      },
      {
        resource: "Conditions",
        fhirType: "Condition",
        description:
          "Pull active diagnoses and problem lists to inform AI-generated clinical notes.",
      },
      {
        resource: "Allergies",
        fhirType: "AllergyIntolerance",
        description:
          "Retrieve allergy and intolerance records for safety context during note generation.",
      },
      {
        resource: "Observations",
        fhirType: "Observation",
        description:
          "Access recent vitals, lab results, and clinical measurements.",
      },
      {
        resource: "Encounters",
        fhirType: "Encounter",
        description:
          "View past consultation history and encounter records for longitudinal context.",
      },
      {
        resource: "Practitioners",
        fhirType: "Practitioner",
        description:
          "Retrieve practitioner details for note attribution and referral addressing.",
      },
    ],
    push: [
      {
        resource: "Clinical Notes",
        fhirType: "DocumentReference",
        description:
          "Push approved SOAP notes and progress notes directly into Genie's patient file.",
      },
      {
        resource: "Referral Letters",
        fhirType: "DocumentReference",
        description:
          "Send clinician-approved referral letters into Genie's outgoing correspondence.",
      },
      {
        resource: "Discharge Summaries",
        fhirType: "DocumentReference",
        description:
          "Push discharge summaries and specialist letters back to the referring practice.",
      },
      {
        resource: "Correspondence",
        fhirType: "DocumentReference",
        description:
          "General clinical correspondence pushed to the patient's Genie record.",
      },
    ],
  },
  dataFlow: [
    {
      step: 1,
      title: "Connect Practice",
      description:
        "Link your Genie Solutions practice to ClinicScribe AI via the Marketplace. OAuth2 credentials are securely exchanged.",
    },
    {
      step: 2,
      title: "Pull Patient Context",
      description:
        "Before each consultation, ClinicScribe pulls demographics, conditions, allergies, and recent observations from Genie.",
    },
    {
      step: 3,
      title: "AI-Assisted Documentation",
      description:
        "During the consultation, ambient transcription captures the conversation. AI drafts structured notes enriched with patient context from Genie.",
    },
    {
      step: 4,
      title: "Clinician Review",
      description:
        "The clinician reviews, edits, and approves every AI-generated draft. Nothing is sent without explicit approval.",
    },
    {
      step: 5,
      title: "Push to Genie",
      description:
        "Approved notes, referral letters, and correspondence are pushed back to Genie as FHIR DocumentReference resources.",
    },
  ],
  security: [
    "OAuth2 client credentials flow — no stored passwords",
    "FHIR-standard data exchange — no proprietary formats",
    "Data hosted in AWS Australia — compliant with Australian privacy law",
    "Minimal data access — only what is needed for documentation",
    "Audit trail for every pull and push operation",
    "Clinician approval required before any data is written back",
  ],
} as const;

// ============================================================
// PRICING
// ============================================================
export const PRICING_DISCLAIMER = "Pricing shown is indicative and subject to change. All plans include a free trial period.";

export const PRICING_TIERS = [
  {
    name: "Solo",
    description: "For individual clinicians",
    price: "$149",
    period: "/month",
    features: [
      "1 clinician seat",
      "Ambient transcription",
      "Structured SOAP notes",
      "Referral draft generation",
      "Up to 80 consultations/month",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Clinic",
    description: "For small to mid-size practices",
    price: "$119",
    period: "/seat/month",
    features: [
      "3–10 clinician seats",
      "Everything in Solo",
      "Billing & coding support",
      "Follow-up task capture",
      "Prescription drafting assist",
      "Priority support",
      "Admin dashboard",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Group Practice",
    description: "For multi-practitioner clinics",
    price: "$99",
    period: "/seat/month",
    features: [
      "11–50 clinician seats",
      "Everything in Clinic",
      "Volume pricing",
      "Dedicated onboarding",
      "Custom note templates",
      "API access",
      "Audit log exports",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    description: "For large or multi-site deployments",
    price: "Custom",
    period: "",
    features: [
      "Unlimited seats",
      "Everything in Group Practice",
      "Custom integrations",
      "On-premise deployment options",
      "SLA guarantees",
      "Dedicated account manager",
      "Compliance reporting",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// ============================================================
// USE CASES
// ============================================================
export const USE_CASES = [
  {
    title: "General Practice",
    icon: "Stethoscope",
    painPoint: "GPs spend 2+ hours per day on documentation, often completing notes after hours. This contributes to burnout and reduces time available for patient care.",
    benefit: "Ambient transcription during consultations drafts complete SOAP notes in seconds. Referral letters and follow-up tasks are pre-populated for review.",
    outputs: ["SOAP notes", "Referral letters", "Follow-up reminders", "MBS billing suggestions"],
    whyAI: "Repetitive documentation from high-volume, short consultations is ideally suited to AI assistance — freeing GPs to focus on clinical reasoning and patient relationships.",
  },
  {
    title: "Specialist Clinics",
    icon: "Brain",
    painPoint: "Specialists deal with complex, detailed clinical notes that require precision. Documentation for procedures, opinions, and management plans is time-intensive.",
    benefit: "Structured notes are tailored to specialty formats. Detailed procedure notes, management plans, and specialist letters are drafted from consultation audio.",
    outputs: ["Specialist letters", "Procedure notes", "Management plans", "Discharge summaries"],
    whyAI: "AI captures the nuance of specialist consultations while maintaining the structured formats that specialists and referring GPs expect.",
  },
  {
    title: "Telehealth",
    icon: "Video",
    painPoint: "Telehealth consultations generate the same documentation burden as in-person visits, but clinicians often lack efficient workflows for remote note-taking.",
    benefit: "Integrates with telehealth platforms to capture audio, transcribe, and draft notes — maintaining documentation quality across in-person and virtual care.",
    outputs: ["Visit summaries", "Telehealth encounter notes", "Patient instructions", "Follow-up scheduling"],
    whyAI: "As telehealth becomes a permanent fixture of Australian healthcare, documentation tools must work seamlessly across both in-person and virtual consultations.",
  },
  {
    title: "Allied Health",
    icon: "Heart",
    painPoint: "Physiotherapists, psychologists, and other allied health professionals face growing documentation requirements with limited administrative support.",
    benefit: "Session notes, treatment plans, and progress reports are drafted from session recordings. Customisable templates match discipline-specific requirements.",
    outputs: ["Session notes", "Treatment plans", "Progress reports", "Referral responses"],
    whyAI: "Allied health professionals often work independently without admin support. AI documentation assistance helps maintain thorough records without the overhead.",
  },
];

// ============================================================
// FAQS
// ============================================================
export const FAQS = [
  {
    question: "Does this replace clinical judgment?",
    answer: "No. ClinicScribe AI is a documentation assistant, not a clinical decision-making tool. It drafts notes, referrals, and follow-up actions based on consultation content. The clinician always reviews, edits, and approves every output before it is finalised or sent.",
  },
  {
    question: "Can it prescribe medications automatically?",
    answer: "No. ClinicScribe AI provides prescription drafting assistance only — it can pre-populate prescription details from consultation context. Every prescription must be reviewed, validated, and approved by the clinician. There is no autonomous prescribing.",
  },
  {
    question: "How does clinician review work?",
    answer: "After the AI generates a draft, it is presented to the clinician in a review interface. Confidence indicators highlight areas that may need attention. The clinician can edit any part of the draft. Nothing is saved, exported, or sent until the clinician explicitly approves it.",
  },
  {
    question: "Is patient consent required?",
    answer: "Yes. We provide configurable consent workflows. Clinics can set their own consent policies — whether that's per-visit verbal consent, written consent, or blanket practice-level consent with opt-out. We recommend consulting your practice's privacy officer.",
  },
  {
    question: "How is health data handled?",
    answer: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Audio recordings can be configured to be deleted after transcription. We are building to Australian healthcare privacy standards and the Australian Privacy Principles. Data residency is Australia-first.",
  },
  {
    question: "Which clinical systems do you integrate with?",
    answer: "We are currently piloting integrations with Best Practice, MedicalDirector, and Genie Solutions. The Genie integration uses FHIR-standard APIs to pull patient context and push approved clinical notes directly into Genie's correspondence. Telehealth platform integration is also in pilot. FHIR R4 and HL7 v2 support is on the roadmap for broader EHR/EMR compatibility.",
  },
  {
    question: "Is this suitable for telehealth?",
    answer: "Yes. ClinicScribe AI can capture audio from telehealth sessions (with appropriate integrations) and works with uploaded recordings. The same transcription, note generation, and review workflow applies to both in-person and telehealth consultations.",
  },
  {
    question: "Can I edit the generated notes?",
    answer: "Absolutely. The clinician has full editing control over every AI-generated draft. You can modify, restructure, or completely rewrite any section. The system also learns from your edits to improve future drafts.",
  },
  {
    question: "Does it support referrals and follow-up actions?",
    answer: "Yes. The system identifies referral needs and follow-up actions from consultation content and drafts appropriate documents. All referral letters, follow-up reminders, and task items are queued for clinician review before being actioned.",
  },
  {
    question: "What is included in prescription drafting assistance?",
    answer: "When medications are discussed during a consultation, the system can pre-populate prescription details (drug, dose, frequency, quantity) in a draft format. The clinician must verify the details against their clinical judgment and approve the prescription through their existing prescribing workflow.",
  },
  {
    question: "How do pilots work?",
    answer: "We offer structured pilot programs for interested clinics. This includes onboarding, training, a trial period with full features, and regular check-ins. Pilots help us refine the product for real-world clinical workflows while giving your practice early access to the technology.",
  },
  {
    question: "What happens if the AI makes an error?",
    answer: "The mandatory clinician review step is designed specifically for this. Confidence indicators help clinicians identify areas where the AI may be less certain. Audit logs record all AI outputs and clinician edits. The clinician is always the final authority on what gets saved.",
  },
];

// ============================================================
// TESTIMONIALS (Placeholder)
// ============================================================
export const TESTIMONIALS = [
  {
    quote: "The documentation burden in general practice is real. Having a system that drafts my notes during the consultation — and lets me review before saving — has genuinely changed my workflow.",
    name: "Dr. Sarah Mitchell",
    role: "General Practitioner",
    clinic: "Pilot Practice, Sydney",
    placeholder: true,
  },
  {
    quote: "What impressed me most was the safety architecture. Mandatory review, audit trails, confidence checks — this feels like it was designed by people who understand clinical responsibility.",
    name: "Dr. James Chen",
    role: "Cardiologist",
    clinic: "Pilot Practice, Melbourne",
    placeholder: true,
  },
  {
    quote: "I was spending 90 minutes after every clinic finishing notes. With ClinicScribe, I review and approve during the session. My notes are done before the patient leaves.",
    name: "Dr. Priya Sharma",
    role: "Paediatrician",
    clinic: "Pilot Practice, Brisbane",
    placeholder: true,
  },
];

// ============================================================
// ROI METRICS
// ============================================================
export const ROI_METRICS = [
  {
    metric: "2+ hours",
    label: "Saved per clinician per day",
    description: "Reduce time spent on clinical documentation, after-hours charting, and administrative follow-up.",
    caveat: "Based on pilot estimates. Actual time savings depend on consultation volume and workflow.",
  },
  {
    metric: "70%",
    label: "Reduction in after-hours documentation",
    description: "Notes are drafted and reviewed during or immediately after consultations, not at the end of the day.",
    caveat: "Pilot estimate. Results vary by practice.",
  },
  {
    metric: "Consistent",
    label: "Documentation quality",
    description: "Structured note formats improve consistency, completeness, and readability across all clinicians in a practice.",
    caveat: "Quality outcomes depend on clinician review and approval.",
  },
  {
    metric: "Faster",
    label: "Downstream workflows",
    description: "Referral letters, follow-up tasks, and billing support are pre-populated and ready for review — reducing handoff delays.",
    caveat: "Workflow speed depends on integration setup and approval workflows.",
  },
];

// ============================================================
// SAFETY PRINCIPLES
// ============================================================
export const SAFETY_PRINCIPLES = [
  {
    title: "Clinician-in-the-Loop",
    description: "Every AI-generated output requires explicit clinician review and approval before it is saved, exported, or acted upon. The clinician is always the final decision-maker.",
    icon: "UserCheck",
  },
  {
    title: "Mandatory Review Gates",
    description: "No clinical note, referral, or prescription draft bypasses the review step. The system enforces approval workflows — there are no shortcuts.",
    icon: "ShieldCheck",
  },
  {
    title: "Confidence Indicators",
    description: "AI outputs include confidence scores and uncertainty flags. Areas with lower confidence are highlighted for clinician attention during review.",
    icon: "AlertTriangle",
  },
  {
    title: "Complete Audit Trail",
    description: "Every AI-generated draft, clinician edit, and approval action is logged with timestamps. Full traceability for compliance, quality, and clinical governance.",
    icon: "ClipboardList",
  },
  {
    title: "Access Controls",
    description: "Role-based access ensures that only authorised clinicians can review, approve, and export clinical documentation. Administrative and clinical roles are separated.",
    icon: "Lock",
  },
  {
    title: "Data Encryption",
    description: "All health data is encrypted in transit (TLS 1.3) and at rest (AES-256). Audio recordings can be configured for automatic deletion after transcription.",
    icon: "KeyRound",
  },
];

// ============================================================
// ROADMAP
// ============================================================
export const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Clinical Note Drafting",
    status: "current" as const,
    items: [
      "Ambient transcription and structured SOAP notes",
      "Referral letter drafting",
      "Follow-up task capture",
      "Prescription drafting assistance",
      "Best Practice and MedicalDirector pilot integrations",
    ],
  },
  {
    phase: "Phase 2",
    title: "Integrations & Workflow Automation",
    status: "next" as const,
    items: [
      "Expanded EHR/EMR integrations",
      "FHIR R4 and HL7 v2 standards support",
      "Telehealth platform integration",
      "Custom note templates",
      "Billing workflow automation",
    ],
  },
  {
    phase: "Phase 3",
    title: "Advanced Clinical Assistance",
    status: "future" as const,
    items: [
      "Multi-encounter patient context",
      "Clinical decision support references",
      "Population health insights",
      "Advanced analytics and practice reporting",
      "International market expansion",
    ],
  },
];
