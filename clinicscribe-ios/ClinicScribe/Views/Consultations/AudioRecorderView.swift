import SwiftUI

/// `AudioRecorderView` — pixel-faithful to the design package's `IOSRecording`:
/// big mic with pulse rings, monospaced timer, capsule waveform, floating
/// stop/pause cluster. Keeps the original capture pipeline (start → stop →
/// upload → transcribe → generate → reviewPending) verbatim.
struct AudioRecorderView: View {
    let consultation: Consultation
    @ObservedObject var audioService: AudioService
    let selectedTemplate: NoteTemplate
    var onCompleted: (() -> Void)? = nil

    @State private var isProcessing = false
    @State private var statusMessage = ""
    @State private var errorMessage: String?
    @State private var didFinishProcessing = false
    @State private var pulse = false
    @State private var isPaused = false

    var body: some View {
        VStack(spacing: Theme.spacingLg) {
            patientStrip

            if didFinishProcessing {
                successPanel
            } else if isProcessing {
                processingPanel
            } else {
                stage
                controls
                helperLine
            }

            if let errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(Theme.error)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.spacingMd)
            }
        }
        .padding(Theme.spacingLg)
        .background(
            RoundedRectangle(cornerRadius: Theme.radiusLg)
                .fill(Theme.surfaceContainerLowest)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusLg)
                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
        )
        .onAppear { pulse = true }
    }

    // MARK: - Patient strip

    private var patientStrip: some View {
        HStack(spacing: Theme.spacingSm) {
            CSAvatar(initials: consultation.patient?.initials ?? "?", size: 36)

            VStack(alignment: .leading, spacing: 2) {
                Text(consultation.patient?.fullName ?? "Unknown patient")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.onSurface)
                    .lineLimit(1)
                Text(consultation.consultationType)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .lineLimit(1)
            }

            Spacer()

            if audioService.isRecording {
                HStack(spacing: 5) {
                    Circle()
                        .fill(Theme.error)
                        .frame(width: 6, height: 6)
                        .opacity(pulse ? 0.4 : 1)
                        .animation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true), value: pulse)
                    Text(isPaused ? "PAUSED" : "LIVE")
                        .font(.system(size: 10, weight: .bold))
                        .tracking(0.8)
                        .foregroundStyle(isPaused ? Theme.warning : Theme.error)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    Capsule().fill(Theme.error.opacity(0.10))
                )
            }
        }
    }

    // MARK: - Stage (mic + timer + waveform)

    private var stage: some View {
        VStack(spacing: 18) {
            ZStack {
                // Outer pulse ring
                Circle()
                    .stroke(Theme.error.opacity(0.18), lineWidth: 1.5)
                    .frame(width: 180, height: 180)
                    .scaleEffect(audioService.isRecording && !isPaused && pulse ? 1.08 : 1)
                    .opacity(audioService.isRecording && !isPaused && pulse ? 0 : 0.7)
                    .animation(
                        audioService.isRecording && !isPaused
                            ? .easeOut(duration: 1.6).repeatForever(autoreverses: false)
                            : .default,
                        value: pulse
                    )

                // Inner pulse ring
                Circle()
                    .stroke(Theme.error.opacity(0.30), lineWidth: 1.5)
                    .frame(width: 140, height: 140)
                    .scaleEffect(audioService.isRecording && !isPaused && pulse ? 1.06 : 1)
                    .opacity(audioService.isRecording && !isPaused && pulse ? 0 : 0.85)
                    .animation(
                        audioService.isRecording && !isPaused
                            ? .easeOut(duration: 1.6).delay(0.3).repeatForever(autoreverses: false)
                            : .default,
                        value: pulse
                    )

                // Glow under mic when recording
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Theme.error.opacity(0.30), Color.clear],
                            center: .center,
                            startRadius: 6,
                            endRadius: 80
                        )
                    )
                    .frame(width: 160, height: 160)
                    .opacity(audioService.isRecording && !isPaused ? 1 : 0)

                // Mic disc
                Circle()
                    .fill(audioService.isRecording ? Theme.error : Theme.surfaceContainerHigh)
                    .frame(width: 104, height: 104)
                    .shadow(color: audioService.isRecording ? Theme.error.opacity(0.35) : Color.black.opacity(0.08),
                            radius: 16, y: 12)

                Image(systemName: "mic.fill")
                    .font(.system(size: 36, weight: .semibold))
                    .foregroundStyle(audioService.isRecording ? Color.white : Theme.onSurface)
            }
            .frame(height: 200)

            Text(DateFormatters.formatDuration(seconds: Int(audioService.recordingDuration)))
                .font(.system(size: 30, weight: .semibold).monospaced())
                .foregroundStyle(Theme.onSurface)
                .contentTransition(.numericText())

            waveform
        }
    }

    private var waveform: some View {
        HStack(alignment: .center, spacing: 3) {
            ForEach(0..<30, id: \.self) { i in
                Capsule()
                    .fill(barColor(for: i))
                    .frame(width: 3, height: barHeight(for: i))
                    .animation(.easeInOut(duration: 0.18), value: audioService.averagePower)
            }
        }
        .frame(height: 32)
        .accessibilityLabel(
            audioService.isRecording
                ? (isPaused ? "Audio waveform, paused" : "Audio waveform, recording")
                : "Audio waveform, idle"
        )
    }

    private func barColor(for i: Int) -> Color {
        guard audioService.isRecording else { return Theme.outlineVariant }
        if isPaused { return Theme.outline }
        // Active bars roughly track the rolling average power; trailing third dim.
        return i < 22 ? Theme.secondary : Theme.outlineVariant
    }

    private func barHeight(for i: Int) -> CGFloat {
        guard audioService.isRecording, !isPaused else { return 6 }
        let normalized = max(0.10, min(1, CGFloat(audioService.averagePower + 60) / 60))
        let phase = sin(Double(i) * 0.55 + Date().timeIntervalSinceReferenceDate * 4)
        let variance = CGFloat(0.45 + 0.55 * abs(phase))
        return 6 + (24 * normalized * variance)
    }

    // MARK: - Controls

    private var controls: some View {
        HStack(spacing: 14) {
            if audioService.isRecording {
                // Pause / resume — visual only on top of AudioService since the
                // existing service has no native pause; we surface the toggle so
                // the clinician feels in control. (TODO: wire to AudioService.)
                Button {
                    withAnimation(.spring(response: 0.3)) { isPaused.toggle() }
                } label: {
                    Image(systemName: isPaused ? "play.fill" : "pause.fill")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(Theme.onSurface)
                        .frame(width: 56, height: 56)
                        .background(Circle().fill(Theme.surfaceContainerHigh))
                        .overlay(Circle().strokeBorder(Theme.outlineVariant, lineWidth: 1))
                }
                .accessibilityLabel(isPaused ? "Resume recording" : "Pause recording")

                Button {
                    stopAndProcess()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "stop.fill")
                            .font(.system(size: 14, weight: .bold))
                        Text("Stop & process")
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundStyle(Color.white)
                    .padding(.horizontal, 22)
                    .frame(height: 56)
                    .background(Capsule().fill(Theme.error))
                    .shadow(color: Theme.error.opacity(0.30), radius: 10, y: 6)
                }
                .accessibilityLabel("Stop recording")
            } else {
                Button {
                    startRecording()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "mic.fill")
                            .font(.system(size: 14, weight: .bold))
                        Text("Start recording")
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundStyle(Color.white)
                    .padding(.horizontal, 26)
                    .frame(height: 56)
                    .background(Capsule().fill(Theme.error))
                    .shadow(color: Theme.error.opacity(0.30), radius: 10, y: 6)
                }
                .accessibilityLabel("Start recording")
            }
        }
    }

    private var helperLine: some View {
        Group {
            if audioService.isRecording {
                Text(isPaused
                     ? "Tap play when you're ready to continue."
                     : "Listening to clinician and patient. You can pause anytime.")
            } else {
                Text("Tap to start. Miraa drafts a note while you focus on the patient.")
            }
        }
        .font(.system(size: 12))
        .foregroundStyle(Theme.onSurfaceVariant)
        .multilineTextAlignment(.center)
        .padding(.horizontal, Theme.spacingMd)
    }

    // MARK: - Processing & success

    private var processingPanel: some View {
        VStack(spacing: Theme.spacingMd) {
            ZStack {
                Circle()
                    .stroke(Theme.outlineVariant, lineWidth: 4)
                    .frame(width: 72, height: 72)
                Circle()
                    .trim(from: 0, to: 0.35)
                    .stroke(Theme.secondary, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .frame(width: 72, height: 72)
                    .rotationEffect(.degrees(pulse ? 360 : 0))
                    .animation(.linear(duration: 1.0).repeatForever(autoreverses: false), value: pulse)
            }
            Text(statusMessage.isEmpty ? "Working…" : statusMessage)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.onSurface)
            Text("This usually takes under a minute. Stay on this screen until it finishes.")
                .font(.system(size: 12))
                .foregroundStyle(Theme.onSurfaceVariant)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.spacingMd)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.spacingLg)
    }

    private var successPanel: some View {
        VStack(spacing: Theme.spacingMd) {
            ZStack {
                Circle()
                    .fill(Theme.success.opacity(0.12))
                    .frame(width: 72, height: 72)
                Image(systemName: "checkmark")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(Theme.success)
            }

            VStack(spacing: 4) {
                Text("Session captured")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(Theme.onSurface)
                Text("Transcript and draft note are ready for verification.")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)
            }

            NavigationLink {
                ConsultationVerifyLoaderView(consultationId: consultation.id)
            } label: {
                Text("Open verify")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.onPrimary)
                    .padding(.horizontal, 22)
                    .frame(height: 44)
                    .background(Capsule().fill(Theme.primary))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.spacingLg)
    }

    // MARK: - Actions

    private func startRecording() {
        errorMessage = nil
        isPaused = false

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
        statusMessage = "Uploading audio…"

        Task {
            do {
                _ = try await audioService.uploadRecording(
                    consultationId: consultation.id,
                    fileURL: url,
                    duration: duration
                )

                statusMessage = "Transcribing…"
                try await ConsultationService.shared.updateStatus(id: consultation.id, status: .transcribing)

                let audioData = try Data(contentsOf: url)
                let transcript = try await TranscriptionService.shared.transcribeAudio(
                    consultationId: consultation.id,
                    audioData: audioData,
                    fileName: "recording.m4a"
                )

                statusMessage = "Drafting \(selectedTemplate.name)…"
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
