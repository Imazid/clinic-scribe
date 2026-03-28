import Foundation

struct NoteTemplate: Codable, Identifiable {
    let id: UUID
    let clinicId: UUID
    var name: String
    var format: NoteFormat
    var systemPromptOverride: String?
    var sections: [String]
    var isDefault: Bool
    let createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case name, format
        case systemPromptOverride = "system_prompt_override"
        case sections
        case isDefault = "is_default"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
