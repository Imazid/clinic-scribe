import SwiftUI

struct MedicationDraftView: View {
    @Binding var medications: [MedicationDraft]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            Text("Medications")
                .font(.headline)
                .foregroundStyle(Theme.onSurface)

            if medications.isEmpty {
                Text("No medications drafted")
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)
            } else {
                ForEach(Array(medications.indices), id: \.self) { index in
                    HStack(spacing: Theme.spacingMd) {
                        Button {
                            medications[index].verified.toggle()
                        } label: {
                            Image(systemName: medications[index].verified ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(medications[index].verified ? Theme.success : Theme.onSurfaceVariant)
                                .accessibilityLabel(medications[index].verified ? "Verified" : "Not verified")
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(medications[index].name)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(Theme.onSurface)
                            Text("\(medications[index].dose) - \(medications[index].frequency)")
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }
                    }
                    .padding(.vertical, Theme.spacingXS)
                    .accessibilityElement(children: .combine)
                }
            }
        }
        .cardStyle()
    }
}
