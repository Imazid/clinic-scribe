import Foundation

struct TranscriptSegment: Codable {
    let start: Double
    let end: Double
    let text: String
    let speaker: String?
}

struct Transcript: Codable, Identifiable {
    let id: UUID
    let consultationId: UUID
    var fullText: String
    var segments: [TranscriptSegment]
    let language: String
    let model: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case consultationId = "consultation_id"
        case fullText = "full_text"
        case segments, language, model
        case createdAt = "created_at"
    }
}
