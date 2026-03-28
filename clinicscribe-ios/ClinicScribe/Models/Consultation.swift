import Foundation

struct Consultation: Codable, Identifiable {
    let id: UUID
    let clinicId: UUID
    let patientId: UUID
    let clinicianId: UUID
    var status: ConsultationStatus
    var consultationType: String
    var durationSeconds: Int?
    let startedAt: String
    var completedAt: String?
    let createdAt: String
    var updatedAt: String

    // Joined relations (optional)
    var patient: Patient?
    var clinician: Profile?
    var audioRecording: AudioRecording?
    var transcript: Transcript?
    var clinicalNote: ClinicalNote?

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case patientId = "patient_id"
        case clinicianId = "clinician_id"
        case status
        case consultationType = "consultation_type"
        case durationSeconds = "duration_seconds"
        case startedAt = "started_at"
        case completedAt = "completed_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case patient, clinician
        case audioRecording = "audio_recording"
        case transcript
        case clinicalNote = "clinical_note"
    }
}
