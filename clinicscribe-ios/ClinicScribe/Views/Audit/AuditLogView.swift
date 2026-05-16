import SwiftUI

struct AuditLogView: View {
    @StateObject private var vm = AuditLogViewModel()

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.spacingMd) {
                    heroStrip
                    CSSearchBar(text: $vm.searchText, placeholder: "Search actions, entities…")
                        .onChange(of: vm.searchText) {
                            Task { await vm.load() }
                        }
                    listContent
                }
                .padding(.horizontal, Theme.spacingMd)
                .padding(.vertical, Theme.spacingSm)
            }
        }
        .background(Theme.surface)
        .navigationTitle("Audit log")
        .task {
            if let clinicId = AuthService.shared.currentProfile?.clinicId {
                vm.clinicId = clinicId
                await vm.load()
            }
        }
    }

    private var heroStrip: some View {
        let total = vm.filteredLogs.count
        let stats: [CSStat] = [
            CSStat(label: "Events", value: "\(total)", sub: "Visible", systemImage: "list.bullet.rectangle"),
            CSStat(label: "Status", value: vm.errorMessage == nil ? "Live" : "Error",
                   sub: vm.errorMessage == nil ? "Streaming" : "See below",
                   systemImage: "checkmark.shield",
                   tone: vm.errorMessage == nil ? .success : .error),
        ]
        return CSHeroStrip(
            eyebrow: "AUDIT",
            title: {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("Complete")
                    CSHeroAccent("traceability")
                    Text(".")
                }
            },
            description: "Every action across the app — note generation, drafts, approvals, exports — recorded for compliance.",
            stats: stats
        )
    }

    @ViewBuilder
    private var listContent: some View {
        Group {
                if vm.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = vm.errorMessage {
                    CSEmptyState(
                        icon: "exclamationmark.triangle",
                        title: "Failed to Load Audit Log",
                        description: error,
                        actionTitle: "Retry"
                    ) {
                        Task { await vm.load() }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if vm.filteredLogs.isEmpty {
                    CSEmptyState(
                        icon: "clipboard",
                        title: "No Audit Entries",
                        description: "Activity will appear here as actions are performed."
                    )
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    LazyVStack(spacing: Theme.spacingSm) {
                        ForEach(vm.filteredLogs) { log in
                            AuditLogRow(log: log)
                        }
                    }
                }
            }
        }
    }

private struct AuditLogRow: View {
    let log: AuditLog

    private var actionIcon: String {
        let action = log.action.lowercased()
        if action.contains("created") || action.contains("create") {
            return "plus.circle"
        } else if action.contains("updated") || action.contains("update") {
            return "pencil.circle"
        } else if action.contains("deleted") || action.contains("delete") {
            return "trash.circle"
        } else if action.contains("approved") || action.contains("approve") {
            return "checkmark.circle"
        } else {
            return "doc.circle"
        }
    }

    private var actionColor: Color {
        let action = log.action.lowercased()
        if action.contains("created") || action.contains("create") {
            return Theme.success
        } else if action.contains("updated") || action.contains("update") {
            return Theme.secondary
        } else if action.contains("deleted") || action.contains("delete") {
            return Theme.error
        } else if action.contains("approved") || action.contains("approve") {
            return Theme.success
        } else {
            return Theme.onSurfaceVariant
        }
    }

    private var relativeTimestamp: String {
        guard let date = DateFormatters.iso8601.date(from: log.createdAt)
                ?? ISO8601DateFormatter().date(from: log.createdAt) else {
            return log.createdAt
        }
        let now = Date()
        let interval = now.timeIntervalSince(date)

        if interval < 60 {
            return "Just now"
        } else if interval < 3600 {
            let minutes = Int(interval / 60)
            return "\(minutes) min\(minutes == 1 ? "" : "s") ago"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "\(hours) hour\(hours == 1 ? "" : "s") ago"
        } else if interval < 172800 {
            return "Yesterday"
        } else if interval < 604800 {
            let days = Int(interval / 86400)
            return "\(days) days ago"
        } else {
            return DateFormatters.formatDateOnly(log.createdAt)
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: Theme.spacingSm + Theme.spacingXS) {
            Image(systemName: actionIcon)
                .font(.title3)
                .foregroundStyle(actionColor)
                .frame(width: 36, height: 36)
                .background(
                    Circle()
                        .fill(actionColor.opacity(0.12))
                )
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: Theme.spacingXS) {
                HStack {
                    Text(log.action.replacingOccurrences(of: "_", with: " ").capitalized)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.onSurface)

                    Spacer()

                    Text(relativeTimestamp)
                        .font(.caption2)
                        .foregroundStyle(Theme.outline)
                }

                HStack(spacing: Theme.spacingSm) {
                    CSBadge(text: log.entityType, variant: .default)

                    Text(log.entityId)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .lineLimit(1)
                }

                if let user = log.user {
                    Text("by \(user.fullName)")
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
        .cardStyle(padding: Theme.spacingSm)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(log.action.replacingOccurrences(of: "_", with: " ").capitalized) on \(log.entityType), \(relativeTimestamp)")
    }
}
