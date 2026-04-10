import Foundation

struct NoteTemplateGroup: Identifiable {
    let id: String
    let title: String
    let templates: [NoteTemplate]
}

enum NoteTemplateCatalog {
    static let allTemplates: [NoteTemplate] = [
        NoteTemplate(
            id: "soap-note",
            name: "SOAP Note",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "General practice",
            description: "Standard subjective, objective, assessment, and plan workflow.",
            sections: ["Subjective", "Objective", "Assessment", "Plan"],
            keywords: ["soap", "general", "follow-up", "review"],
            isDefault: true
        ),
        NoteTemplate(
            id: "soap-note-issues",
            name: "SOAP Note (Including Issues)",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "General practice",
            description: "SOAP note with a dedicated issues list for complex follow-up.",
            sections: ["Subjective", "Objective", "Issues", "Assessment", "Plan"],
            keywords: ["soap", "issues", "follow-up", "complex"],
        ),
        NoteTemplate(
            id: "h-and-p",
            name: "H & P",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "General medicine",
            description: "History and physical note for consultations and admissions.",
            sections: ["History", "Examination", "Assessment", "Plan"],
            keywords: ["history", "physical", "admission", "consult"],
        ),
        NoteTemplate(
            id: "h-and-p-issues",
            name: "H & P (Including Issues)",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "General medicine",
            description: "History and physical note with an added issues section.",
            sections: ["History", "Examination", "Issues", "Assessment", "Plan"],
            keywords: ["history", "physical", "issues"],
        ),
        NoteTemplate(
            id: "nephrology-consultation",
            name: "Nephrology Consultation",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "Nephrology",
            description: "Initial nephrology assessment for referral or inpatient consults.",
            sections: ["Reason for review", "Background", "Examination", "Assessment", "Plan"],
            keywords: ["nephrology", "kidney", "consultation"],
        ),
        NoteTemplate(
            id: "nephrology-note",
            name: "Nephrology Note",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "Nephrology",
            description: "Follow-up nephrology note for interval review and management.",
            sections: ["Interval history", "Examination", "Assessment", "Plan"],
            keywords: ["nephrology", "renal", "follow-up"],
        ),
        NoteTemplate(
            id: "renal-review-note",
            name: "Renal Review Note",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "Nephrology",
            description: "Renal review template for kidney function, medications, and surveillance.",
            sections: ["Interval history", "Renal function", "Assessment", "Plan"],
            keywords: ["renal", "review", "kidney"],
        ),
        NoteTemplate(
            id: "pediatric-nephrology-clinic",
            name: "Pediatric Nephrology Clinic",
            kind: .clinicalNote,
            preferredFormat: .soap,
            specialty: "Paediatric nephrology",
            description: "Paediatric nephrology clinic structure with family-centred follow-up.",
            sections: ["History", "Growth and examination", "Assessment", "Plan"],
            keywords: ["paediatric", "nephrology", "clinic"],
        ),
        NoteTemplate(
            id: "ckd-clinic-letter",
            name: "CKD Clinic Letter",
            kind: .letter,
            preferredFormat: .visitSummary,
            specialty: "Nephrology",
            description: "Clinic letter for chronic kidney disease follow-up and recommendations.",
            sections: ["Summary", "Kidney function", "Medication changes", "Plan", "Follow-up"],
            keywords: ["ckd", "letter", "clinic", "nephrology"],
        ),
        NoteTemplate(
            id: "nephrology-outpatient-clinic-letter-follow-up",
            name: "Nephrology Outpatient Clinic Letter Follow Up",
            kind: .letter,
            preferredFormat: .visitSummary,
            specialty: "Nephrology",
            description: "Outpatient follow-up letter for nephrology clinics and shared care.",
            sections: ["Clinical summary", "Results", "Assessment", "Plan", "Follow-up"],
            keywords: ["nephrology", "follow-up", "letter"],
        ),
        NoteTemplate(
            id: "initial-ckd-nutrition-assessment",
            name: "Initial CKD Nutrition Assessment",
            kind: .clinicalNote,
            preferredFormat: .progress,
            specialty: "Renal dietetics",
            description: "First nutrition assessment for chronic kidney disease management.",
            sections: ["Diet history", "Assessment", "Counselling", "Goals"],
            keywords: ["ckd", "nutrition", "dietitian"],
        ),
        NoteTemplate(
            id: "patient-explainer-letter",
            name: "Patient Explainer Letter",
            kind: .patientEducation,
            preferredFormat: .visitSummary,
            specialty: nil,
            description: "Plain-language explanation of the visit, changes, and next steps.",
            sections: ["What we discussed", "Medication changes", "What to watch for", "Next steps"],
            keywords: ["patient", "education", "plain language"],
        ),
        NoteTemplate(
            id: "referral-letter",
            name: "Referral Letter",
            kind: .letter,
            preferredFormat: .visitSummary,
            specialty: nil,
            description: "Standard referral letter for specialist communication.",
            sections: ["Reason for referral", "Background", "Findings", "Request"],
            keywords: ["referral", "letter"],
        ),
        NoteTemplate(
            id: "generic-referral-letter",
            name: "Generic Referral Letter",
            kind: .letter,
            preferredFormat: .visitSummary,
            specialty: nil,
            description: "Flexible referral letter for broad specialist handover.",
            sections: ["Reason for referral", "Background", "Assessment", "Request"],
            keywords: ["referral", "generic", "letter"],
        ),
        NoteTemplate(
            id: "letter-to-referring-practitioner",
            name: "Letter to Referring Practitioner",
            kind: .letter,
            preferredFormat: .visitSummary,
            specialty: nil,
            description: "Clinical update back to the referring practitioner.",
            sections: ["Summary", "Assessment", "Plan", "Medications"],
            keywords: ["referrer", "practitioner", "letter"],
        ),
        NoteTemplate(
            id: "medical-certificate",
            name: "Medical Certificate",
            kind: .form,
            preferredFormat: .visitSummary,
            specialty: nil,
            description: "Simple certificate structure for work or study absences.",
            sections: ["Patient details", "Reason", "Certificate text", "Dates"],
            keywords: ["certificate", "medical", "form"],
        ),
        NoteTemplate(
            id: "carers-certificate",
            name: "Carer's Certificate",
            kind: .form,
            preferredFormat: .visitSummary,
            specialty: nil,
            description: "Certificate for carer leave and supporting documentation.",
            sections: ["Patient details", "Reason", "Certificate text", "Dates"],
            keywords: ["carer", "certificate"],
        ),
        NoteTemplate(
            id: "work-cover-form",
            name: "Work Cover Form",
            kind: .form,
            preferredFormat: .progress,
            specialty: nil,
            description: "Work cover documentation with capacity and restriction guidance.",
            sections: ["Injury summary", "Capacity", "Restrictions", "Recommendations"],
            keywords: ["workcover", "form", "restrictions"],
        ),
        NoteTemplate(
            id: "smart-goals",
            name: "SMART Goals",
            kind: .planning,
            preferredFormat: .progress,
            specialty: nil,
            description: "Structured goal-setting for recovery, rehab, and behaviour change.",
            sections: ["Specific", "Measurable", "Achievable", "Relevant", "Time-bound"],
            keywords: ["goals", "planning", "rehab"],
        ),
        NoteTemplate(
            id: "issues-list",
            name: "Issues List",
            kind: .planning,
            preferredFormat: .progress,
            specialty: nil,
            description: "Concise problem list with status and action items.",
            sections: ["Problem", "Status", "Plan"],
            keywords: ["issues", "list", "problem"],
        ),
        NoteTemplate(
            id: "ward-round-clinical-handover-note",
            name: "Ward Round / Clinical Handover Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Clinical handover and ward round note with concise escalation language.",
            sections: ["Situation", "Background", "Assessment", "Recommendation"],
            keywords: ["ward", "handover", "inpatient", "handoff"],
        ),
        NoteTemplate(
            id: "allied-health-team-meeting-note",
            name: "Allied Health Team Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: "Allied health",
            description: "Multidisciplinary allied health discussion and action plan.",
            sections: ["Case overview", "Input", "Plan", "Actions"],
            keywords: ["allied health", "meeting", "multidisciplinary"],
        ),
        NoteTemplate(
            id: "board-executive-meeting-minutes",
            name: "Board / Executive Meeting Minutes",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Board-level minutes with decisions and action tracking.",
            sections: ["Attendees", "Agenda", "Decisions", "Actions"],
            keywords: ["board", "executive", "minutes"],
        ),
        NoteTemplate(
            id: "business-meeting",
            name: "Business Meeting",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "General business meeting note with decisions and follow-up.",
            sections: ["Agenda", "Discussion", "Actions"],
            keywords: ["business", "meeting"],
        ),
        NoteTemplate(
            id: "case-review-clinical-supervision-note",
            name: "Case Review / Clinical Supervision Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Structured case review or supervision note for clinical teams.",
            sections: ["Case summary", "Discussion", "Actions"],
            keywords: ["supervision", "case review", "clinical"],
        ),
        NoteTemplate(
            id: "clinical-governance-meeting-note",
            name: "Clinical Governance Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Governance note focused on risks, quality, and safety actions.",
            sections: ["Topics", "Risks", "Actions"],
            keywords: ["governance", "quality", "safety"],
        ),
        NoteTemplate(
            id: "departmental-team-meeting-note",
            name: "Departmental Team Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Department-wide meeting note with progress updates and actions.",
            sections: ["Agenda", "Updates", "Actions"],
            keywords: ["departmental", "meeting"],
        ),
        NoteTemplate(
            id: "discharge-planning-meeting-note",
            name: "Discharge Planning Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Discharge planning with barriers, timing, and next steps.",
            sections: ["Admission summary", "Barriers", "Discharge plan"],
            keywords: ["discharge", "planning", "meeting"],
        ),
        NoteTemplate(
            id: "family-meeting-case-conference-note",
            name: "Family Meeting / Case Conference Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Family meeting or case conference note with decisions and responsibilities.",
            sections: ["Participants", "Summary", "Decisions", "Follow-up"],
            keywords: ["family", "case conference", "meeting"],
        ),
        NoteTemplate(
            id: "mdt-meeting-note",
            name: "MDT Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Multidisciplinary team meeting note for aligned plans of care.",
            sections: ["Case summary", "Team input", "Plan", "Actions"],
            keywords: ["mdt", "multidisciplinary", "meeting"],
        ),
        NoteTemplate(
            id: "mental-health-care-planning-meeting",
            name: "Mental Health Care Planning Meeting",
            kind: .planning,
            preferredFormat: .progress,
            specialty: "Mental health",
            description: "Care planning structure for mental health review and coordination.",
            sections: ["Presenting issues", "Risk", "Plan", "Follow-up"],
            keywords: ["mental health", "care plan", "review"],
        ),
        NoteTemplate(
            id: "morbidity-and-mortality-meeting-note",
            name: "Morbidity and Mortality (M&M) Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "M&M note with case summary, discussion, and learning points.",
            sections: ["Case summary", "Discussion", "Learning points", "Actions"],
            keywords: ["m&m", "morbidity", "mortality", "meeting"],
        ),
        NoteTemplate(
            id: "practice-clinic-management-meeting-note",
            name: "Practice / Clinic Management Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Operations meeting note for clinic management and improvement work.",
            sections: ["Agenda", "Discussion", "Decisions", "Actions"],
            keywords: ["practice", "clinic management", "meeting"],
        ),
        NoteTemplate(
            id: "quality-improvement-project-meeting-note",
            name: "Quality Improvement Project Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "QI meeting note for measures, changes, and next actions.",
            sections: ["Aim", "Measures", "Changes", "Actions"],
            keywords: ["quality improvement", "qi", "meeting"],
        ),
        NoteTemplate(
            id: "network-meeting-note",
            name: "Network Meeting Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "External stakeholder or network meeting note with action tracking.",
            sections: ["Agenda", "Discussion", "Actions"],
            keywords: ["network", "meeting"],
        ),
        NoteTemplate(
            id: "clinical-supervision-note",
            name: "Clinical Supervision Note",
            kind: .meeting,
            preferredFormat: .progress,
            specialty: nil,
            description: "Clinical supervision note for case discussion and support.",
            sections: ["Case summary", "Supervision points", "Actions"],
            keywords: ["supervision", "clinical", "meeting"],
        ),
    ]

    static let categoryOrder: [String] = [
        "Clinical Notes",
        "Specialty Packs",
        "Letters",
        "Patient Education",
        "Forms",
        "Planning",
        "Meetings",
    ]

    static var groups: [NoteTemplateGroup] {
        groups(for: allTemplates)
    }

    static func groups(for templates: [NoteTemplate]) -> [NoteTemplateGroup] {
        categoryOrder.compactMap { title in
            let categoryTemplates = self.templates(in: title, from: templates)
            guard !categoryTemplates.isEmpty else { return nil }
            return NoteTemplateGroup(id: title.lowercased().replacingOccurrences(of: " ", with: "-"), title: title, templates: categoryTemplates)
        }
    }

    static var defaultTemplate: NoteTemplate {
        allTemplates.first(where: { $0.isDefault }) ?? allTemplates[0]
    }

    static func template(withId id: String, in templates: [NoteTemplate] = allTemplates) -> NoteTemplate? {
        templates.first(where: { $0.id == id })
    }

    static func templates(in category: String, from templates: [NoteTemplate] = allTemplates) -> [NoteTemplate] {
        templates.filter { template in
            switch category {
            case "Clinical Notes":
                return template.kind == .clinicalNote
            case "Specialty Packs":
                return template.kind == .clinicalNote
                    && template.specialty != nil
                    && template.specialty != "General practice"
                    && template.specialty != "General medicine"
            case "Letters":
                return template.kind == .letter
            case "Patient Education":
                return template.kind == .patientEducation
            case "Forms":
                return template.kind == .form
            case "Planning":
                return template.kind == .planning
            case "Meetings":
                return template.kind == .meeting
            default:
                return false
            }
        }
        .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }

    static func suggestedTemplate(
        for consultationType: String,
        transcript: String? = nil,
        templates: [NoteTemplate] = allTemplates
    ) -> NoteTemplate {
        let lower = consultationType.lowercased()
        if lower.contains("nephro") {
            return template(withId: "nephrology-consultation", in: templates) ?? defaultTemplate
        }
        if lower.contains("mental health") {
            return template(withId: "mental-health-care-planning-meeting", in: templates) ?? defaultTemplate
        }
        if lower.contains("nutrition") {
            return template(withId: "initial-ckd-nutrition-assessment", in: templates) ?? defaultTemplate
        }
        if lower.contains("follow") {
            return template(withId: "soap-note-issues", in: templates) ?? defaultTemplate
        }
        if lower.contains("assessment") {
            return template(withId: "h-and-p", in: templates) ?? defaultTemplate
        }
        if let transcript, transcript.lowercased().contains("certificate") {
            return template(withId: "medical-certificate", in: templates) ?? defaultTemplate
        }
        return template(withId: defaultTemplate.id, in: templates) ?? defaultTemplate
    }

    static func searchResults(for query: String, templates: [NoteTemplate] = allTemplates) -> [NoteTemplate] {
        let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !normalized.isEmpty else { return templates }
        return templates.filter { $0.searchText.contains(normalized) }
    }
}
