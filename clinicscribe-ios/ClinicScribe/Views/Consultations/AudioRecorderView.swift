import SwiftUI

struct AudioRecorderView: View {
    let consultation: Consultation
    @ObservedObject var audioService: AudioService
    let selectedTemplate: NoteTemplate
    var onCompleted: (() -> Void)? = nil

    @State private var isProcessing = false
    @State private var statusMessage = ""
    @State private var errorMessage: String?
    @State private var didFinishProcessing = false

    var body: some View {
        CSCard {
            VStack(spacing: Theme.spacingLg) {
                waveform

                Text(DateFormatters.formatDuration(seconds: Int(audioService.recordingDuration)))
                    .font(.system(size: 48, weight: .light, design: .monospaced))
                    .foregroundStyle(Theme.onSurface)

                if let errorMessage {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(Theme.error)
                        .multilineTextAlignment(.center)
                }

                if didFinishProcessing {
                    VStack(spacing: Theme.spacingSm) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(Theme.success)

                        Text("Session captured")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)

                        Text("The transcript and draft note are ready for review.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .multilineTextAlignment(.center)

                        NavigationLink {
                            ConsultationVerifyLoaderView(consultationId: consultation.id)
                        } label: {
                            Text("Open Verify")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.onPrimary)
                                .padding(.horizontal, Theme.spacingLg)
                                .padding(.vertical, Theme.spacingSm)
                                .background(Theme.primary)
                                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                        }
                    }
                } else if isProcessing {
                    VStack(spacing: Theme.spacingSm) {
                        ProgressView()
                        Text(statusMessage)
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }
                } else {
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
                        } else {
                            Button {
                                startRecording()
                            } label: {
                                Image(systemName: "record.circle")
                                    .font(.system(size: 64))
                                    .foregroundStyle(Theme.error)
                                    .accessibilityLabel("Start recording")
                            }
                        }
                    }
                }
            }
        }
    }

    private var waveform: some View {
        HStack(spacing: 3) {
            ForEach(0..<20, id: \.self) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(audioService.isRecording ? Theme.error : Theme.outlineVariant)
                    .frame(width: Theme.spacingXS, height: barHeight(for: index))
                    .animation(.easeInOut(duration: 0.15), value: audioService.averagePower)
            }
        }
        .frame(height: 40)
        .accessibilityLabel(audioService.isRecording ? "Audio waveform, recording in progress" : "Audio waveform, idle")
    }

    private func barHeight(for index: Int) -> CGFloat {
        guard audioService.isRecording else { return Theme.spacingSm }
        let normalized = max(0.08, min(1, CGFloat(audioService.averagePower + 60) / 60))
        let variance = CGFloat((index % 5) + 1) / 5
        return 10 + (28 * normalized * variance)
    }

    private func startRecording() {
        errorMessage = nil

        do {
            try audioService.startRecording()
        } catch {
            errorMessage = "Unable to start recording: \(error.localizedDescription)"
        }
    }

    private func stopAndProcess() {
        guard let (url, duration) = audioService.stopRecording() else {
            errorMessage = "The recording could not be finalised."
            return
        }

        isProcessing = true
        errorMessage = nil
        statusMessage = "Uploading audio..."

        Task {
            do {
                _ = try await audioService.uploadRecording(
                    consultationId: consultation.id,
                    fileURL: url,
                    duration: duration
                )

                statusMessage = "Transcribing..."
                try await ConsultationService.shared.updateStatus(id: consultation.id, status: .transcribing)

                let audioData = try Data(contentsOf: url)
                let transcript = try await TranscriptionService.shared.transcribeAudio(
                    consultationId: consultation.id,
                    audioData: audioData,
                    fileName: "recording.m4a"
                )

                statusMessage = "Generating \(selectedTemplate.name)..."
                try await ConsultationService.shared.updateStatus(id: consultation.id, status: .generating)
                _ = try await NoteGenerationService.shared.generateNote(
                    consultationId: consultation.id,
                    transcript: transcript.fullText,
                    template: selectedTemplate
                )

                try await ConsultationService.shared.updateStatus(id: consultation.id, status: .reviewPending)

                isProcessing = false
                didFinishProcessing = true
                onCompleted?()
            } catch {
                isProcessing = false
                errorMessage = "Capture failed: \(error.localizedDescription)"
            }
        }
    }
}
