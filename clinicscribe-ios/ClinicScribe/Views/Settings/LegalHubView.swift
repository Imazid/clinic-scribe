import SwiftUI

struct LegalSection: Hashable {
    let heading: String
    let paragraphs: [String]
}

struct LegalDocument: Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let lastUpdated: String
    let highlights: [String]
    let sections: [LegalSection]
}

enum LegalContentLibrary {
    static let privacyPolicy = LegalDocument(
        id: "privacy",
        title: "Privacy Policy",
        description: "How Miraa handles account information, consultation data, transcripts, and generated clinical outputs.",
        lastUpdated: "April 5, 2026",
        highlights: [
            "Only the minimum account, clinic, and consultation data needed to operate the service is collected.",
            "Protected health information may be processed to generate transcripts, notes, tasks, and related workflow output.",
            "Clinic access should remain limited to authorised users within the workspace."
        ],
        sections: [
            LegalSection(
                heading: "Information collected",
                paragraphs: [
                    "Miraa may collect account details such as clinician name, email address, clinic identity, role, and subscription metadata. It also processes consultation records, audio recordings, transcripts, note drafts, generated documents, and workflow activity created within the product.",
                    "Where a clinic uploads or dictates clinical information, that information may include protected health information and patient identifiers needed to produce the requested documentation output."
                ]
            ),
            LegalSection(
                heading: "How information is used",
                paragraphs: [
                    "Information is used to authenticate users, scope access to the correct clinic, generate clinical documentation, store workflow history, surface follow-up actions, and support billing, audit, reliability, and security operations.",
                    "Clinical content is processed only for the purpose of delivering the documentation and workflow features requested by the clinic or clinician."
                ]
            ),
            LegalSection(
                heading: "Sharing and retention",
                paragraphs: [
                    "Clinic data should only be disclosed to hosting, transcription, AI, storage, billing, and security providers required to operate the service or comply with law.",
                    "Retention should align with clinic configuration, contractual commitments, and applicable legal or regulatory requirements. Clinics remain responsible for determining whether stored records satisfy their local obligations."
                ]
            )
        ]
    )

    static let termsOfService = LegalDocument(
        id: "terms",
        title: "Terms of Service",
        description: "The product rules for account use, acceptable behaviour, subscriptions, and clinical review obligations.",
        lastUpdated: "April 5, 2026",
        highlights: [
            "Miraa provides draft workflow output and does not replace clinician judgement or final review.",
            "Each clinic is responsible for account security, regulatory compliance, and appropriate patient consent.",
            "Subscriptions, seats, and feature access may vary by plan and can be suspended for misuse or non-payment."
        ],
        sections: [
            LegalSection(
                heading: "Service scope",
                paragraphs: [
                    "Miraa provides software tools that assist with preparation, live capture, transcription, note generation, verification, tasks, templates, and related clinical workflow output.",
                    "The service is provided as a clinical workflow support product. It does not independently diagnose, prescribe, or assume responsibility for final patient care decisions."
                ]
            ),
            LegalSection(
                heading: "Acceptable use",
                paragraphs: [
                    "Users must not upload unlawful material, attempt unauthorised access, interfere with other tenants, reverse engineer protected services, or use the platform in a way that violates law, professional duties, or third-party rights.",
                    "Generated output must be reviewed by a qualified human before it is relied on, shared externally, or committed to the medical record."
                ]
            ),
            LegalSection(
                heading: "Billing and liability",
                paragraphs: [
                    "The subscribing clinic is responsible for its users, seat allocation, payment obligations, and any activity that occurs under its workspace. Access may be restricted or suspended for material misuse, unpaid invoices, or security risk.",
                    "To the maximum extent allowed by law, Miraa should not be liable for indirect or consequential loss arising from misuse, delayed review, inaccurate source material, local compliance failures, or reliance on unreviewed AI output."
                ]
            )
        ]
    )

    static let dataProcessing = LegalDocument(
        id: "data-processing",
        title: "Data Processing & Security",
        description: "Operational safeguards, clinic obligations, and the way consultation content moves through the workflow.",
        lastUpdated: "April 5, 2026",
        highlights: [
            "Clinic workspaces should remain logically separated and access-controlled.",
            "Security, audit, and retention controls should be reviewed by each clinic before rollout.",
            "Clinics remain responsible for local privacy, recordkeeping, and patient-notice requirements."
        ],
        sections: [
            LegalSection(
                heading: "Processing roles",
                paragraphs: [
                    "For most clinic workflows, the clinic acts as the controller or responsible entity for patient data entered into the service, while Miraa acts as the processor or hosted service provider delivering the requested workflow functions.",
                    "If a clinic requires a separate data processing agreement, security schedule, or subprocessor review, that should be handled before production rollout."
                ]
            ),
            LegalSection(
                heading: "Security safeguards",
                paragraphs: [
                    "Miraa should use role-based access, authenticated sessions, audit visibility, and managed infrastructure controls appropriate for the sensitivity of the data processed through the platform.",
                    "Clinics should still maintain internal device security, user offboarding, credential hygiene, and local incident response procedures."
                ]
            ),
            LegalSection(
                heading: "Incident handling",
                paragraphs: [
                    "Security issues, suspected unauthorised access, and data handling concerns should be escalated promptly through the clinic’s designated support and incident contacts.",
                    "Clinics are responsible for their own downstream notification duties where required by law."
                ]
            )
        ]
    )

    static let aiSafety = LegalDocument(
        id: "ai-safety",
        title: "AI Clinical Safety & Medical Disclaimer",
        description: "How to use AI-generated drafts safely inside a clinician-reviewed documentation workflow.",
        lastUpdated: "April 5, 2026",
        highlights: [
            "AI output may be incomplete, inaccurate, or overly confident and must be reviewed before use.",
            "The platform supports clinical documentation workflow; it does not replace clinical judgement.",
            "Clinicians remain responsible for the final chart, orders, instructions, and communications."
        ],
        sections: [
            LegalSection(
                heading: "Human review is mandatory",
                paragraphs: [
                    "Drafts, summaries, task suggestions, and generated documents produced by Miraa are assistive outputs only. A qualified human must review them before they are filed, exported, or shared externally.",
                    "Users should verify names, medications, diagnoses, referrals, timelines, and follow-up instructions against the source consultation and the patient record."
                ]
            ),
            LegalSection(
                heading: "Not medical advice",
                paragraphs: [
                    "Miraa does not provide independent medical advice, diagnosis, prescribing recommendations, or clinical authorisation. It is a clinician-reviewed workflow platform designed to support preparation, documentation, and follow-up while clinicians remain responsible for the final output.",
                    "If a generated statement is unsupported, ambiguous, or clinically unsafe, it should be corrected or removed before approval."
                ]
            ),
            LegalSection(
                heading: "Safe deployment expectations",
                paragraphs: [
                    "Clinics should define internal review rules, staff training, escalation paths, and template governance before rolling the product out broadly.",
                    "High-risk use cases and local legal requirements should be reviewed by the clinic’s own compliance and clinical leadership teams."
                ]
            )
        ]
    )

    static let allDocuments = [privacyPolicy, termsOfService, dataProcessing, aiSafety]
}

struct LegalHubView: View {
    let documents: [LegalDocument]

    init(documents: [LegalDocument] = LegalContentLibrary.allDocuments) {
        self.documents = documents
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                CSPageHeader(
                    title: "Legal & Privacy",
                    subtitle: "Privacy, service terms, data handling, and the clinician review safeguards that govern Miraa usage."
                )

                ForEach(documents) { document in
                    NavigationLink {
                        LegalDocumentDetailView(document: document)
                    } label: {
                        CSCard(variant: .filled) {
                            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                                HStack(alignment: .top, spacing: Theme.spacingSm) {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(document.title)
                                            .font(.headline)
                                            .foregroundStyle(Theme.onSurface)
                                        Text(document.description)
                                            .font(.subheadline)
                                            .foregroundStyle(Theme.onSurfaceVariant)
                                    }

                                    Spacer()

                                    Image(systemName: "chevron.right")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(Theme.onSurfaceVariant)
                                }

                                Text("Last updated \(document.lastUpdated)")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(Theme.secondary)

                                VStack(alignment: .leading, spacing: Theme.spacingXS) {
                                    ForEach(document.highlights.prefix(2), id: \.self) { highlight in
                                        HStack(alignment: .top, spacing: Theme.spacingSm) {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundStyle(Theme.secondary)
                                                .font(.caption)
                                                .padding(.top, 2)
                                            Text(highlight)
                                                .font(.caption)
                                                .foregroundStyle(Theme.onSurfaceVariant)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(Theme.spacingLg)
        }
        .background(Theme.surface)
        .navigationTitle("Legal")
    }
}

struct LegalDocumentDetailView: View {
    let document: LegalDocument

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                CSPageHeader(title: document.title, subtitle: document.description)

                CSCard(variant: .filled) {
                    VStack(alignment: .leading, spacing: Theme.spacingSm) {
                        Text("Last updated \(document.lastUpdated)")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.secondary)

                        ForEach(document.highlights, id: \.self) { highlight in
                            HStack(alignment: .top, spacing: Theme.spacingSm) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Theme.secondary)
                                    .font(.caption)
                                    .padding(.top, 2)
                                Text(highlight)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.onSurface)
                            }
                        }
                    }
                }

                ForEach(document.sections, id: \.self) { section in
                    CSCard(variant: .filled) {
                        VStack(alignment: .leading, spacing: Theme.spacingSm) {
                            Text(section.heading)
                                .font(.headline)
                                .foregroundStyle(Theme.onSurface)

                            ForEach(section.paragraphs, id: \.self) { paragraph in
                                Text(paragraph)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                }
            }
            .padding(Theme.spacingLg)
        }
        .background(Theme.surface)
        .navigationTitle(document.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
