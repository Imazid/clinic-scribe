import Foundation

struct AudioRecording: Codable, Identifiable {
    let id: UUID
    let consultationId: UUID
    let storagePath: String
    let fileName: String
    let fileSize: Int
    let durationSeconds: Int
    let mimeType: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case consultationId = "consultation_id"
        case storagePath = "storage_path"
        case fileName = "file_name"
        case fileSize = "file_size"
        case durationSeconds = "duration_seconds"
        case mimeType = "mime_type"
        case createdAt = "created_at"
    }
}
