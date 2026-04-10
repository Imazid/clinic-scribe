import SwiftUI

struct TranscriptViewer: View {
    let transcript: Transcript
    var embedded: Bool = false

    var body: some View {
        Group {
            if embedded {
                transcriptContent
            } else {
                transcriptContent
                    .cardStyle()
            }
        }
    }

    private var transcriptContent: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            Text("Transcript")
                .font(.headline)
                .foregroundStyle(Theme.onSurface)

            if transcript.segments.isEmpty {
                Text(transcript.fullText)
                    .font(.body)
                    .foregroundStyle(Theme.onSurface)
            } else {
                ForEach(Array(transcript.segments.enumerated()), id: \.offset) { _, segment in
                    HStack(alignment: .top, spacing: Theme.spacingSm) {
                        Text(DateFormatters.formatDuration(seconds: Int(segment.start)))
                            .font(.caption.monospaced())
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .frame(width: 44, alignment: .trailing)

                        Text(segment.text)
                            .font(.body)
                            .foregroundStyle(Theme.onSurface)
                    }
                    .accessibilityElement(children: .combine)
                }
            }
        }
    }
}
