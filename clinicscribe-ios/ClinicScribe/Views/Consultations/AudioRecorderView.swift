import SwiftUI

struct AudioRecorderView: View {
    let consultation: Consultation
    @ObservedObject var audioService: AudioService
    @State private var isProcessing = false
    @State private var statusMessage = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: Theme.spacingLg) {
            // Waveform indicator
            HStack(spacing: 3) {
                ForEach(0..<20, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(audioService.isRecording ? Theme.error : Theme.outlineVariant)
                        .frame(width: Theme.spacingXS, height: audioService.isRecording ? CGFloat.random(in: 8...Theme.spacingXL) : Theme.spacingSm)
                        .animation(.easeInOut(duration: 0.15), value: audioService.isRecording)
                }
            }
            .frame(height: 40)
            .accessibilityLabel(audioService.isRecording ? "Audio waveform, recording in progress" : "Audio waveform, idle")

            // Duration
            Text(DateFormatters.formatDuration(seconds: Int(audioService.recordingDuration)))
                .font(.system(size: 48, weight: .light, design: .monospaced))
                .foregroundStyle(Theme.onSurface)

            // Controls
            HStack(spacing: Theme.spacingXL) {
                if audioService.isRecording {
                    Button {
                        stopAndProcess()
                    } label: {
                        Image(systemName: "stop.circle.fill")
                            .font(.system(size: 64))
                            .foregroundStyle(Theme.error)
                            .accessibilityLabel("Stop recording")
                    }
                } else if !isProcessing {
                    Button {
                        try? audioService.startRecording()
                    } label: {
                        Image(systemName: "record.circle")
                            .font(.system(size: 64))
                            .foregroundStyle(Theme.error)
                            .accessibilityLabel("Start recording")
                    }
                }
            }

            if isProcessing {
                VStack(spacing: Theme.spacingSm) {
                    ProgressView()
                    Text(statusMessage)
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
        .cardStyle()
    }

    private func stopAndProcess() {
        guard let (url, duration) = audioService.stopRecording() else { return }
        isProcessing = true

        Task {
            statusMessage = "Uploading audio..."
            _ = try? await audioService.uploadRecording(consultationId: consultation.id, fileURL: url, duration: duration)

            statusMessage = "Transcribing..."
            try await ConsultationService.shared.updateStatus(id: consultation.id, status: .transcribing)

            let audioData = try Data(contentsOf: url)
            let transcript = try await TranscriptionService.shared.transcribeAudio(
                consultationId: consultation.id, audioData: audioData, fileName: "recording.m4a"
            )

            statusMessage = "Generating note..."
            try await ConsultationService.shared.updateStatus(id: consultation.id, status: .generating)
            _ = try await NoteGenerationService.shared.generateNote(
                consultationId: consultation.id, transcript: transcript.fullText
            )

            try await ConsultationService.shared.updateStatus(id: consultation.id, status: .reviewPending)
            isProcessing = false
            dismiss()
        }
    }
}
