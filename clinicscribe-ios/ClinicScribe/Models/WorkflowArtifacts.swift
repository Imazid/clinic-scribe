import Foundation

enum NoteVerificationStatus: String, Codable, CaseIterable {
    case pending
    case ready
    case qaFlagged = "qa_flagged"
    case approved
}

enum CareTaskStatus: String, Codable, CaseIterable {
    case open
    case inProgress = "in_progress"
    case completed
    case cancelled

    var label: String {
        switch self {
        case .open:
            return "Open"
        case .inProgress:
            return "In Progress"
        case .completed:
            return "Completed"
        case .cancelled:
            return "Cancelled"
        }
    }

    var badgeVariant: CSBadgeVariant {
        switch self {
        case .open:
            return .warning
        case .inProgress:
            return .info
        case .completed:
            return .success
        case .cancelled:
            return .default
        }
    }
}

enum CareTaskCategory: String, Codable, CaseIterable {
    case followUp = "follow_up"
    case resultCheck = "result_check"
    case referral
    case medicationReview = "medication_review"
    case patientEducation = "patient_education"

    var label: String {
        switch self {
        case .followUp:
            return "Follow Up"
        case .resultCheck:
            return "Result Check"
        case .referral:
            return "Referral"
        case .medicationReview:
            return "Medication Review"
        case .patientEducation:
            return "Patient Education"
        }
    }
}

enum GeneratedDocumentKind: String, Codable, CaseIterable {
    case patientSummary = "patient_summary"
    case patientInstructions = "patient_instructions"
    case patientFamilyEmail = "patient_family_email"
    case referralLetter = "referral_letter"
    case resultReminder = "result_reminder"
    case followUpLetter = "follow_up_letter"
    case workCertificate = "work_certificate"
    case medicalCertificate = "medical_certificate"
    case carePlan = "care_plan"
    case visitSummary = "visit_summary"
}

enum GeneratedDocumentStatus: String, Codable, CaseIterable {
    case draft
    case ready
    case sent
}

enum NoteProvenanceSource: String, Codable, CaseIterable {
    case transcript
    case chart
    case importedResult = "imported_result"
    case inferred
    case needsReview = "needs_review"
}

struct NoteProvenanceItem: Codable, Identifiable {
    var section: String
    var sentence: String
    var source: NoteProvenanceSource
    var rationale: String
    var confidence: Double

    var id: String {
        [section, sentence, source.rawValue]
            .joined(separator: "::")
    }
}

struct NoteQAFinding: Codable, Identifiable {
    var code: String
    var title: String
    var detail: String
    var severity: String
    var section: String?
    var suggestedFix: String?

    var id: String {
        [code, section ?? "", title]
            .joined(separator: "::")
    }

    enum CodingKeys: String, CodingKey {
        case code, title, detail, severity, section
        case suggestedFix = "suggested_fix"
    }
}

struct VisitBrief: Codable, Identifiable {
    let id: UUID
    var clinicId: UUID
    var patientId: UUID
    var consultationId: UUID
    var status: String
    var summary: String
    var activeProblems: [String]
    var medicationChanges: [String]
    var abnormalResults: [String]
    var unresolvedItems: [String]
    var likelyAgenda: [String]
    var clarificationQuestions: [String]
    var sourceContext: [String: AnyCodable]?
    var createdBy: UUID?
    var updatedBy: UUID?
    var generatedAt: String?
    var createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case patientId = "patient_id"
        case consultationId = "consultation_id"
        case status
        case summary
        case activeProblems = "active_problems"
        case medicationChanges = "medication_changes"
        case abnormalResults = "abnormal_results"
        case unresolvedItems = "unresolved_items"
        case likelyAgenda = "likely_agenda"
        case clarificationQuestions = "clarification_questions"
        case sourceContext = "source_context"
        case createdBy = "created_by"
        case updatedBy = "updated_by"
        case generatedAt = "generated_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct CareTask: Codable, Identifiable {
    let id: UUID
    var clinicId: UUID
    var patientId: UUID
    var consultationId: UUID
    var noteId: UUID?
    var title: String
    var description: String
    var dueAt: String?
    var status: CareTaskStatus
    var category: CareTaskCategory
    var ownerUserId: UUID?
    var source: String
    var metadata: [String: AnyCodable]?
    var completedAt: String?
    var createdAt: String
    var updatedAt: String
    var patient: Patient?
    var consultation: TaskConsultationSummary?

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case patientId = "patient_id"
        case consultationId = "consultation_id"
        case noteId = "note_id"
        case title
        case description
        case dueAt = "due_at"
        case status
        case category
        case ownerUserId = "owner_user_id"
        case source
        case metadata
        case completedAt = "completed_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case patient
        case consultation
    }
}

struct TaskConsultationSummary: Codable, Identifiable {
    let id: UUID
    var consultationType: String
    var status: ConsultationStatus
    var startedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case consultationType = "consultation_type"
        case status
        case startedAt = "started_at"
    }
}

struct GeneratedDocument: Codable, Identifiable {
    let id: UUID
    var clinicId: UUID
    var patientId: UUID
    var consultationId: UUID
    var noteId: UUID?
    var kind: GeneratedDocumentKind
    var title: String
    var status: GeneratedDocumentStatus
    var content: String
    var metadata: [String: AnyCodable]?
    var createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case patientId = "patient_id"
        case consultationId = "consultation_id"
        case noteId = "note_id"
        case kind
        case title
        case status
        case content
        case metadata
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct TimelineEvent: Codable, Identifiable {
    let id: String
    var clinicId: UUID
    var patientId: UUID
    var consultationId: UUID?
    var eventType: String
    var title: String
    var summary: String
    var eventDate: String
    var metadata: [String: String]?
    var createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case patientId = "patient_id"
        case consultationId = "consultation_id"
        case eventType = "event_type"
        case title
        case summary
        case eventDate = "event_date"
        case metadata
        case createdAt = "created_at"
    }
}

struct PatientSummarySnapshot: Codable {
    var heading: String
    var plainLanguageSummary: String
    var keyPoints: [String]
    var medicationChanges: [String]
    var nextSteps: [String]
    var seekHelp: [String]
    var language: String
    var readingLevel: String

    enum CodingKeys: String, CodingKey {
        case heading
        case plainLanguageSummary = "plain_language_summary"
        case keyPoints = "key_points"
        case medicationChanges = "medication_changes"
        case nextSteps = "next_steps"
        case seekHelp = "seek_help"
        case language
        case readingLevel = "reading_level"
    }
}
