import Foundation

enum TaskDateFilter: String, CaseIterable {
    case all = "All"
    case today = "Today"
    case upcoming = "Upcoming"
    case overdue = "Overdue"

    func matches(_ task: CareTask) -> Bool {
        guard let dueAt = task.dueAt,
              let dueDate = DateFormatters.iso8601.date(from: dueAt) ?? ISO8601DateFormatter().date(from: dueAt) else {
            return self == .all
        }

        let calendar = Calendar.current
        let now = Date()

        switch self {
        case .all:
            return true
        case .today:
            return calendar.isDate(dueDate, inSameDayAs: now)
        case .upcoming:
            return dueDate > now && !calendar.isDate(dueDate, inSameDayAs: now)
        case .overdue:
            return dueDate < now && !calendar.isDate(dueDate, inSameDayAs: now)
        }
    }
}

@MainActor
final class TaskListViewModel: ObservableObject {
    @Published var tasks: [CareTask] = []
    @Published var searchText = ""
    @Published var statusFilter: CareTaskStatus?
    @Published var categoryFilter: CareTaskCategory?
    @Published var dateFilter: TaskDateFilter = .all
    @Published var isLoading = true
    @Published var isSaving = false
    @Published var errorMessage: String?

    var clinicId: UUID?

    var filteredTasks: [CareTask] {
        let normalizedQuery = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return tasks.filter { task in
            let matchesQuery = normalizedQuery.isEmpty || [
                task.title,
                task.description,
                task.patient?.fullName,
                task.consultation?.consultationType,
            ]
            .compactMap { $0?.lowercased() }
            .contains { $0.contains(normalizedQuery) }

            let matchesStatus = statusFilter == nil || task.status == statusFilter
            let matchesCategory = categoryFilter == nil || task.category == categoryFilter
            let matchesDate = dateFilter.matches(task)

            return matchesQuery && matchesStatus && matchesCategory && matchesDate
        }
    }

    func load() async {
        guard let clinicId else {
            isLoading = false
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            tasks = try await CareTaskService.shared.getTasks(clinicId: clinicId)
        } catch {
            errorMessage = "Failed to load tasks: \(error.localizedDescription)"
        }

        isLoading = false
    }

    func markTaskCompleted(_ task: CareTask) async {
        guard !isSaving else { return }
        isSaving = true
        errorMessage = nil

        do {
            let updated = try await CareTaskService.shared.updateTaskStatus(id: task.id, status: .completed)
            if let index = tasks.firstIndex(where: { $0.id == updated.id }) {
                tasks[index] = updated
            }
        } catch {
            errorMessage = "Failed to update task: \(error.localizedDescription)"
        }

        isSaving = false
    }

    func insertOrReplaceTask(_ task: CareTask) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
        } else {
            tasks.insert(task, at: 0)
        }
    }
}
