import SwiftUI

private struct Integration: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let status: Status
    let category: String

    enum Status: String {
        case connected, pilot, planned

        var label: String {
            switch self {
            case .connected: return "Connected"
            case .pilot: return "Pilot"
            case .planned: return "Planned"
            }
        }

        var badgeVariant: CSBadgeVariant {
            switch self {
            case .connected: return .success
            case .pilot: return .info
            case .planned: return .default
            }
        }

        var icon: String {
            switch self {
            case .connected: return "checkmark.circle.fill"
            case .pilot: return "bolt.fill"
            case .planned: return "clock"
            }
        }
    }
}

private let integrations: [Integration] = [
    .init(name: "Best Practice", description: "Direct integration with Australia's most popular GP software", status: .pilot, category: "Clinical Software"),
    .init(name: "MedicalDirector", description: "Seamless note export and patient record sync", status: .pilot, category: "Clinical Software"),
    .init(name: "Genie Solutions", description: "Integration for specialist practice management", status: .planned, category: "Clinical Software"),
    .init(name: "Telehealth Platforms", description: "Audio capture from telehealth sessions", status: .pilot, category: "Telehealth"),
    .init(name: "FHIR R4", description: "Standards-based interoperability for EHR/EMR systems", status: .planned, category: "Standards"),
    .init(name: "HL7 v2", description: "Legacy health system messaging support", status: .planned, category: "Standards"),
    .init(name: "eRx Script Exchange", description: "Prescription draft pre-population", status: .planned, category: "Prescribing"),
    .init(name: "Medicare Online", description: "MBS item billing code suggestions", status: .planned, category: "Billing"),
]

struct IntegrationsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                Text("Connect Miraa with your existing clinical systems.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .padding(.horizontal)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.spacingSm + Theme.spacingXS) {
                    ForEach(integrations) { integration in
                        IntegrationCard(integration: integration)
                    }
                }
                .padding(.horizontal)

                CSCard {
                    VStack(alignment: .leading, spacing: Theme.spacingSm) {
                        Text("Configuration happens on the web app")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)
                        Text("iPhone shows connection status and rollout readiness, but live connector setup is managed in the web workspace so governance and clinic-wide sync settings stay in one place.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Theme.surface)
        .navigationTitle("Integrations")
    }
}

private struct IntegrationCard: View {
    let integration: Integration

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            HStack {
                Image(systemName: "link")
                    .font(.body)
                    .foregroundStyle(Theme.secondary)
                    .frame(width: Theme.spacingXL, height: Theme.spacingXL)
                    .background(Theme.secondaryFixed.opacity(0.3))
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
                    .accessibilityLabel("Integration")

                Spacer()

                HStack(spacing: Theme.spacingXS) {
                    Image(systemName: integration.status.icon)
                        .font(.caption2)
                        .accessibilityHidden(true)
                    Text(integration.status.label)
                        .font(.caption2.weight(.medium))
                }
                .padding(.horizontal, Theme.spacingSm)
                .padding(.vertical, Theme.spacingXS)
                .background(badgeBackground)
                .foregroundStyle(badgeForeground)
                .clipShape(Capsule())
                .accessibilityLabel("Status: \(integration.status.label)")
            }

            Text(integration.name)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.onSurface)

            Text(integration.description)
                .font(.caption)
                .foregroundStyle(Theme.onSurfaceVariant)
                .lineLimit(3)

            Spacer(minLength: 0)

            Text(integration.category)
                .font(.caption2)
                .foregroundStyle(Theme.outline)

            Text(integration.status == .planned ? "Planned for a later rollout" : "Managed from the web workspace")
                .font(.caption.weight(.medium))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.vertical, Theme.spacingSm)
                .padding(.horizontal, Theme.spacingSm)
                .background(Theme.surfaceContainer)
                .foregroundStyle(integration.status == .planned ? Theme.outline : Theme.primary)
                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
        }
        .padding(Theme.spacingSm + Theme.spacingXS)
        .background(Theme.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
        .themeShadow(Theme.elevationLow)
    }

    private var badgeBackground: Color {
        switch integration.status {
        case .connected: return Theme.successContainer
        case .pilot: return Theme.secondaryFixed.opacity(0.3)
        case .planned: return Theme.surfaceContainer
        }
    }

    private var badgeForeground: Color {
        switch integration.status {
        case .connected: return Theme.success
        case .pilot: return Theme.secondary
        case .planned: return Theme.outline
        }
    }
}
