import Foundation

@MainActor
final class AuditLogViewModel: ObservableObject {
    @Published var logs: [AuditLog] = []
    @Published var searchText = ""
    @Published var isLoading = true
    @Published var errorMessage: String?

    var clinicId: UUID?

    var filteredLogs: [AuditLog] {
        if searchText.isEmpty { return logs }
        return logs.filter {
            $0.action.localizedCaseInsensitiveContains(searchText) ||
            $0.entityType.localizedCaseInsensitiveContains(searchText) ||
            $0.entityId.localizedCaseInsensitiveContains(searchText)
        }
    }

    func load() async {
        guard let clinicId else { return }
        isLoading = true
        errorMessage = nil
        do {
            logs = try await AuditService.shared.getAuditLogs(
                clinicId: clinicId,
                search: searchText.isEmpty ? nil : searchText
            )
        } catch {
            errorMessage = error.localizedDescription
            print("Audit load error: \(error)")
        }
        isLoading = false
    }
}
