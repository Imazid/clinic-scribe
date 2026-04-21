// ============================================================
// BRAND — Change these to rebrand the entire site
// ============================================================
export const BRAND = {
  name: "Miraa",
  shortName: "Miraa",
  expandedName: "Medical Insights, Record, Automation and Assistance",
  tagline: "Clinical Workflow Copilot",
  description: "Miraa, short for Medical Insights, Record, Automation and Assistance, is the clinical workflow copilot that prepares the visit, captures the consult, verifies outputs, and closes the loop after care.",
  url: "https://miraahealth.com",
  supportEmail: "hello@miraahealth.com",
  demoEmail: "demo@miraahealth.com",
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
      { label: "Workflow", href: "/product", description: "Prepare, capture, verify, and close the consult" },
      { label: "Integrations", href: "/integrations", description: "Connect with your existing clinical systems" },
      { label: "Use Cases", href: "/use-cases", description: "Built for GP and specialty workflows" },
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
    title: "Live Transcription",
    description: "Capture patient-clinician conversations in real time or upload recorded audio. Speaker separation, interruption recovery, and transcript scoring keep the visit usable.",
    tag: "Core",
  },
  {
    icon: "FileText",
    title: "Structured Note Workspace",
    description: "AI drafts SOAP notes, progress notes, and visit summaries using recognised medical terminology, with a structured extraction panel alongside the transcript.",
    tag: "Core",
  },
  {
    icon: "Sparkles",
    title: "Template-Based Generation",
    description: "Template builders, prompt chips, and versioned note patterns keep outputs consistent across clinicians and specialties.",
    tag: "Workflow",
  },
  {
    icon: "Receipt",
    title: "Document Generation",
    description: "Generate letters, patient instructions, forms, and summaries from one consult, then route them for clinician review before export.",
    tag: "Workflow",
  },
  {
    icon: "ListChecks",
    title: "Follow-up Closure",
    description: "Turn plan items into tracked tasks with due dates, statuses, and clear closeout actions instead of leaving them buried in text.",
    tag: "Workflow",
  },
  {
    icon: "MessageSquareHeart",
    title: "Patient Explain Mode",
    description: "Convert the consult into a plain-English after-visit summary, with language that can be exported, printed, or shared.",
    tag: "Assist",
  },
  {
    icon: "ShieldCheck",
    title: "Fact Provenance",
    description: "Every statement can be traced to the transcript, imported chart data, or an inferred flag, so reviewers know what the AI heard and what it guessed.",
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
    title: "Prepare",
    description: "Brief the consult with prior notes, active problems, medications, recent results, and unresolved follow-up items before the visit starts.",
    icon: "ClipboardList",
  },
  {
    step: 2,
    title: "Capture",
    description: "Run live transcription with speaker separation, interruption recovery, and structured extraction while the visit is happening.",
    icon: "Mic",
  },
  {
    step: 3,
    title: "Verify",
    description: "Review the note with provenance labels, confidence indicators, and QA checks for contradictions, unsupported facts, and stale content.",
    icon: "ShieldCheck",
  },
  {
    step: 4,
    title: "Close",
    description: "Convert approved plan items into tasks, patient summaries, documents, and follow-up actions so the consult actually finishes.",
    icon: "CheckCircle",
  },
  {
    step: 5,
    title: "Export",
    description: "Send approved outputs to clinical systems through integration-ready exports and FHIR-compatible pathways.",
    icon: "Upload",
  },
  {
    step: 6,
    title: "Track",
    description: "Keep reminders, follow-up tasks, and unresolved items visible until the loop is closed.",
    icon: "ListChecks",
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
        "Link your Genie Solutions practice to Miraa via the Marketplace. OAuth2 credentials are securely exchanged.",
    },
    {
      step: 2,
      title: "Pull Patient Context",
      description:
        "Before each consultation, Miraa pulls demographics, conditions, allergies, and recent observations from Genie.",
    },
      {
        step: 3,
        title: "AI-Assisted Documentation",
        description:
        "During the consultation, live capture records the conversation. AI drafts structured notes enriched with patient context from Genie.",
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
export const PRICING_DISCLAIMER = "Pricing is preview-only and subject to change. Checkout is not live yet, and every plan will include a 14-day free trial when Miraa launches.";

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
    cta: "Coming Soon",
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
    cta: "Coming Soon",
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
    cta: "Coming Soon",
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
    cta: "Coming Soon",
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
    painPoint: "GPs spend time before, during, and after consultations moving between charts, transcripts, and follow-up items. That creates friction and reduces time available for patient care.",
    benefit: "The workflow copilot briefs the consult, captures the conversation, and turns the plan into reviewed notes, documents, and tasks.",
    outputs: ["Visit briefs", "SOAP notes", "Referral letters", "Follow-up tasks"],
    whyAI: "High-volume GP work benefits from structured context and closeout support because the same patterns repeat every day across many consults.",
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
    painPoint: "Telehealth consultations still create a full preparation, capture, and follow-up burden, but clinicians often lack a single workflow for remote visits.",
    benefit: "The same prepare-capture-verify-close flow works for telehealth, keeping documentation and follow-up consistent across in-person and virtual care.",
    outputs: ["Visit summaries", "Telehealth encounter notes", "Patient instructions", "Follow-up scheduling"],
    whyAI: "As telehealth stays embedded in Australian healthcare, the workflow has to work the same way whether the consult is in room or on screen.",
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
    answer: "No. Miraa is a clinical workflow copilot, not a clinical decision-making tool. It prepares context, drafts notes and documents, and surfaces follow-up actions based on consultation content. The clinician always reviews, edits, and approves every output before it is finalised or sent.",
  },
  {
    question: "Can it prescribe medications automatically?",
    answer: "No. Miraa provides prescription drafting assistance only — it can pre-populate prescription details from consultation context. Every prescription must be reviewed, validated, and approved by the clinician. There is no autonomous prescribing.",
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
    answer: "Yes. Miraa can capture audio from telehealth sessions (with appropriate integrations) and works with uploaded recordings. The same capture, note generation, and review workflow applies to both in-person and telehealth consultations.",
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
    quote: "The workflow burden in general practice is real. Having a system that briefs the visit, drafts the note, and lets me verify before saving has changed my workflow.",
    name: "Dr. Sarah Mitchell",
    role: "General Practitioner",
    clinic: "Pilot Practice, Sydney",
    placeholder: true,
  },
  {
    quote: "What impressed me most was the safety architecture. Mandatory review, audit trails, confidence checks — this feels like it was designed by people who understand clinical responsibility.",
    name: "Dr. James Chen",
    role: "Cardiologist",
    clinic: "Pilot Practice, Sydney",
    placeholder: true,
  },
  {
    quote: "I was spending 90 minutes after every clinic finishing notes. With Miraa, I review and approve during the session. My notes are done before the patient leaves.",
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
    description: "Reduce time spent on preparation, documentation, and closeout work across the consult lifecycle.",
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
    title: "Workflow Foundation",
    status: "current" as const,
    items: [
      "Live transcription and structured note workspace",
      "Template builders and document generation",
      "Follow-up tasks and closeout tracking",
      "GP-first consultation flows",
      "Integration-ready exports",
    ],
  },
  {
    phase: "Phase 2",
    title: "Differentiators",
    status: "next" as const,
    items: [
      "Pre-visit briefing engine",
      "Longitudinal patient timeline",
      "Fact provenance and QA checks",
      "Patient explain summaries",
      "Expanded EMR context imports",
    ],
  },
  {
    phase: "Phase 3",
    title: "Moat",
    status: "future" as const,
    items: [
      "Chart and transcript reconciliation",
      "Clinic rule engine",
      "Specialty workflow packs",
      "Governance and analytics",
      "Quality scoring",
    ],
  },
];

// ============================================================
// PRE-LAUNCH / WAITLIST
// ============================================================
export const PRELAUNCH = {
  headline: "Prepare, capture, verify,",
  rotatingWords: ["brief", "track", "close", "document"],
  headlineSuffix: "the visit with one workflow.",
  subheadline: `${BRAND.shortName} is still on the way. Join the waitlist now and we will let you know when the app launches and when your 14-day free trial is ready.`,
  socialProofCount: 500,
  socialProofText: "clinicians following the workflow",
  ctaText: "Join the Waitlist",
  successTitle: "You're on the waitlist!",
  successMessage: "We'll email you when Miraa launches and when the 14-day free trial opens.",
} as const;

export const EARLY_ACCESS_BENEFITS = [
  {
    icon: "Sparkles",
    title: "Launch Updates",
    description: "Stay close to the release and see what ships in the first version before public sign-up opens.",
  },
  {
    icon: "MessageSquareHeart",
    title: "First Trial Access",
    description: "Waitlist members will be first to know when the 14-day free trial is available.",
  },
  {
    icon: "Rocket",
    title: "Priority Launch Window",
    description: "Get first notice when Miraa opens so your practice can move early when onboarding begins.",
  },
] as const;

export const WAITLIST_ROLES = [
  { value: "gp", label: "GP" },
  { value: "specialist", label: "Specialist" },
  { value: "allied-health", label: "Allied Health" },
  { value: "practice-manager", label: "Practice Manager" },
  { value: "other", label: "Other" },
] as const;
