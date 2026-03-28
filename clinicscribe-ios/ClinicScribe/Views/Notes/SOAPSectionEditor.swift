import SwiftUI

struct SOAPSectionEditor: View {
    let title: String
    @Binding var text: String

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text(title)
                .font(.headline)
                .foregroundStyle(Theme.primary)

            TextEditor(text: $text)
                .font(.body)
                .frame(minHeight: 100)
                .padding(Theme.spacingSm)
                .background(Theme.surfaceContainerLow)
                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.radiusSm)
                        .stroke(Theme.outlineVariant, lineWidth: 1)
                }
        }
    }
}
