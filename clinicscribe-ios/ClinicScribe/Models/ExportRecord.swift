import Foundation

struct ExportRecord: Codable, Identifiable {
    let id: UUID
    let consultationId: UUID
    let noteId: UUID
    let format: ExportFormat
    let filePath: String?
    let exportedBy: UUID
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case consultationId = "consultation_id"
        case noteId = "note_id"
        case format
        case filePath = "file_path"
        case exportedBy = "exported_by"
        case createdAt = "created_at"
    }
}
