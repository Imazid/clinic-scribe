import SwiftUI

struct FollowUpTasksView: View {
    @Binding var tasks: [FollowUpTask]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            Text("Follow-up Tasks")
                .font(.headline)
                .foregroundStyle(Theme.onSurface)

            if tasks.isEmpty {
                Text("No follow-up tasks")
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)
            } else {
                ForEach(Array(tasks.indices), id: \.self) { index in
                    HStack(spacing: Theme.spacingMd) {
                        Button {
                            tasks[index].completed.toggle()
                        } label: {
                            Image(systemName: tasks[index].completed ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(tasks[index].completed ? Theme.success : Theme.onSurfaceVariant)
                                .accessibilityLabel(tasks[index].completed ? "Completed" : "Not completed")
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(tasks[index].description)
                                .font(.subheadline)
                                .foregroundStyle(Theme.onSurface)
                                .strikethrough(tasks[index].completed)
                            if let due = tasks[index].dueDate {
                                Text("Due: \(due)")
                                    .font(.caption)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                            }
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
