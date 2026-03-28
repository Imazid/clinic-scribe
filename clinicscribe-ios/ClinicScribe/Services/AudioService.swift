import Foundation
import AVFoundation
import Supabase

@MainActor
final class AudioService: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var recordingDuration: TimeInterval = 0
    @Published var averagePower: Float = 0

    private var audioRecorder: AVAudioRecorder?
    private var timer: Timer?
    private var recordingURL: URL?

    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    func startRecording() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .default)
        try session.setActive(true)

        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("m4a")

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: AppConfig.audioSampleRate,
            AVNumberOfChannelsKey: AppConfig.audioChannels,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
        ]

        audioRecorder = try AVAudioRecorder(url: url, settings: settings)
        audioRecorder?.isMeteringEnabled = true
        audioRecorder?.record()
        recordingURL = url
        isRecording = true
        recordingDuration = 0

        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self, let recorder = self.audioRecorder else { return }
                recorder.updateMeters()
                self.recordingDuration = recorder.currentTime
                self.averagePower = recorder.averagePower(forChannel: 0)
            }
        }
    }

    func stopRecording() -> (URL, TimeInterval)? {
        timer?.invalidate()
        timer = nil
        audioRecorder?.stop()
        isRecording = false

        guard let url = recordingURL else { return nil }
        let duration = recordingDuration
        return (url, duration)
    }

    func uploadRecording(consultationId: UUID, fileURL: URL, duration: TimeInterval) async throws -> AudioRecording {
        let data = try Data(contentsOf: fileURL)
        let fileName = "\(consultationId.uuidString)/recording.m4a"
        let storagePath = "audio-recordings/\(fileName)"

        try await supabase.storage
            .from("audio-recordings")
            .upload(path: fileName, file: data, options: .init(contentType: "audio/m4a"))

        struct AudioInsert: Encodable {
            let consultation_id: UUID
            let storage_path: String
            let file_name: String
            let file_size: Int
            let duration_seconds: Int
            let mime_type: String
        }

        return try await supabase.from("audio_recordings")
            .insert(AudioInsert(
                consultation_id: consultationId,
                storage_path: storagePath,
                file_name: "recording.m4a",
                file_size: data.count,
                duration_seconds: Int(duration),
                mime_type: "audio/m4a"
            ))
            .select()
            .single()
            .execute()
            .value
    }
}
