import SwiftUI

struct LiveTranscriptView: View {
    let segments: [TranscriptSegment]
    var interimText: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text("Live Transcript")
                .font(.headline)
                .foregroundStyle(Theme.onSurface)

            ScrollView {
                VStack(alignment: .leading, spacing: Theme.spacingXS) {
                    ForEach(Array(segments.enumerated()), id: \.offset) { _, segment in
                        Text(segment.text)
                            .font(.body)
                            .foregroundStyle(Theme.onSurface)
                    }

                    if !interimText.isEmpty {
                        Text(interimText)
                            .font(.body)
                            .foregroundStyle(Theme.onSurfaceVariant.opacity(0.6))
                            .italic()
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(maxHeight: 200)
        }
        .cardStyle()
    }
}
