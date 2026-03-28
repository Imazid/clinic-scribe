import Foundation
import Supabase

struct TranscriptionResponse: Decodable {
    let text: String
    let segments: [TranscriptSegment]
}

@MainActor
final class TranscriptionService {
    static let shared = TranscriptionService()
    private var supabase: SupabaseClient { SupabaseManager.shared.client }
    private init() {}

    func transcribeAudio(consultationId: UUID, audioData: Data, fileName: String) async throws -> Transcript {
        // Upload audio to API route
        let responseData = try await APIClient.shared.upload(
            path: "/api/transcribe",
            fileData: audioData,
            fileName: fileName,
            mimeType: "audio/m4a"
        )

        let transcription = try JSONDecoder().decode(TranscriptionResponse.self, from: responseData)

        // Store transcript in Supabase
        struct TranscriptInsert: Encodable {
            let consultation_id: UUID
            let full_text: String
            let segments: [TranscriptSegment]
            let language: String
            let model: String
        }

        let result: Transcript = try await supabase.from("transcripts")
            .insert(TranscriptInsert(
                consultation_id: consultationId,
                full_text: transcription.text,
                segments: transcription.segments,
                language: "en",
                model: "whisper-1"
            ))
            .select()
            .single()
            .execute()
            .value

        return result
    }
}
