import Foundation

struct SOAPNote: Codable {
    var subjective: String
    var objective: String
    var assessment: String
    var plan: String
}

struct ConfidenceScores: Codable {
    var subjective: Double
    var objective: Double
    var assessment: Double
    var plan: Double
    var overall: Double
}

struct MedicationDraft: Codable, Identifiable {
    var id: String { name + dose }
    var name: String
    var dose: String
    var frequency: String
    var quantity: String
    var verified: Bool
}

struct FollowUpTask: Codable, Identifiable {
    var id: String { description }
    var description: String
    var dueDate: String?
    var completed: Bool

    enum CodingKeys: String, CodingKey {
        case description
        case dueDate = "due_date"
        case completed
    }
}

struct ClinicalNote: Codable, Identifiable {
    let id: UUID
    let consultationId: UUID
    var version: Int
    var format: NoteFormat
    var content: SOAPNote
    var confidenceScores: ConfidenceScores
    var medications: [MedicationDraft]
    var followUpTasks: [FollowUpTask]
    var referrals: [String]
    let aiModel: String
    let aiPromptVersion: String
    var isApproved: Bool
    var approvedBy: UUID?
    var approvedAt: String?
    let createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case consultationId = "consultation_id"
        case version, format, content
        case confidenceScores = "confidence_scores"
        case medications
        case followUpTasks = "follow_up_tasks"
        case referrals
        case aiModel = "ai_model"
        case aiPromptVersion = "ai_prompt_version"
        case isApproved = "is_approved"
        case approvedBy = "approved_by"
        case approvedAt = "approved_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
