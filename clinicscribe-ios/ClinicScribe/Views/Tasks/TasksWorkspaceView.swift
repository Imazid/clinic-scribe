import SwiftUI

struct TasksWorkspaceView: View {
    @StateObject private var vm = TaskListViewModel()
    @ObservedObject private var auth = AuthService.shared
    @State private var showCreateTaskSheet = false

    var body: some View {
        VStack(spacing: 0) {
            header

            if let errorMessage = vm.errorMessage {
                HStack(spacing: Theme.spacingSm) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(Theme.error)
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurface)
                        .lineLimit(2)
                    Spacer()
                    Button("Retry") {
                        Task { await vm.load() }
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.primary)
                }
                .padding(Theme.spacingSm)
                .background(Theme.errorContainer)
                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
                .padding(.horizontal, Theme.spacingMd)
                .padding(.bottom, Theme.spacingSm)
            }

            if vm.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if vm.filteredTasks.isEmpty {
                CSEmptyState(
                    icon: "checklist.unchecked",
                    title: "No tasks yet",
                    description: "Tasks saved from consultations will appear here, and you can also create manual follow-up work.",
                    actionTitle: "Create task"
                ) {
                    showCreateTaskSheet = true
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.horizontal, Theme.spacingLg)
            } else {
                List(vm.filteredTasks) { task in
                    TaskRow(task: task, isSaving: vm.isSaving) {
                        Task { await vm.markTaskCompleted(task) }
                    }
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                }
                .listStyle(.plain)
                .refreshable { await vm.load() }
            }
        }
        .background(Theme.surface)
        .navigationTitle("Tasks")
        .toolbar {
            Button {
                showCreateTaskSheet = true
            } label: {
                Image(systemName: "plus")
                    .accessibilityLabel("Create task")
            }
        }
        .sheet(isPresented: $showCreateTaskSheet) {
            NewTaskSheet(clinicId: auth.clinicId, ownerUserId: auth.profileId) { task in
                vm.insertOrReplaceTask(task)
            }
        }
        .task {
            vm.clinicId = auth.clinicId
            await vm.load()
        }
        .onChange(of: auth.clinicId) { _, newValue in
            vm.clinicId = newValue
            Task { await vm.load() }
        }
    }

    private var header: some View {
        VStack(spacing: Theme.spacingSm) {
            VStack(alignment: .leading, spacing: Theme.spacingXS) {
                Text("Keep post-visit work moving")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Theme.primary)
                Text("Search, triage, and complete the follow-up work that keeps consultations progressing to closeout.")
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            CSSearchBar(text: $vm.searchText, placeholder: "Search a task or patient")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.spacingSm) {
                    CSFilterChip(title: "All", isSelected: vm.statusFilter == nil) {
                        vm.statusFilter = nil
                    }

                    ForEach(CareTaskStatus.allCases, id: \.self) { status in
                        CSFilterChip(title: status.label, isSelected: vm.statusFilter == status) {
                            vm.statusFilter = status
                        }
                    }
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.spacingSm) {
                    CSFilterChip(title: "Any category", isSelected: vm.categoryFilter == nil) {
                        vm.categoryFilter = nil
                    }

                    ForEach(CareTaskCategory.allCases, id: \.self) { category in
                        CSFilterChip(title: category.label, isSelected: vm.categoryFilter == category) {
                            vm.categoryFilter = category
                        }
                    }
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.spacingSm) {
                    ForEach(TaskDateFilter.allCases, id: \.self) { filter in
                        CSFilterChip(title: filter.rawValue, isSelected: vm.dateFilter == filter) {
                            vm.dateFilter = filter
                        }
                    }

                    Button("Reset filters") {
                        vm.statusFilter = nil
                        vm.categoryFilter = nil
                        vm.dateFilter = .all
                        vm.searchText = ""
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
        .padding(Theme.spacingMd)
    }
}

private struct TaskRow: View {
    let task: CareTask
    let isSaving: Bool
    let onComplete: () -> Void

    var body: some View {
        CSCard(variant: .filled) {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                HStack(alignment: .top, spacing: Theme.spacingSm) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(task.title)
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)

                        Text(task.patient?.fullName ?? "Unknown patient")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }

                    Spacer()

                    CSBadge(text: task.status.label, variant: task.status.badgeVariant)
                }

                if !task.description.isEmpty {
                    Text(task.description)
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurface)
                }

                HStack(spacing: Theme.spacingSm) {
                    CSBadge(text: task.category.label, variant: .info)

                    if let dueAt = task.dueAt, !dueAt.isEmpty {
                        CSBadge(text: "Due \(DateFormatters.formatDateOnly(dueAt))")
                    }

                    if let consultation = task.consultation {
                        CSBadge(text: consultation.consultationType)
                    }
                }

                if task.status != .completed {
                    CSButton(
                        title: "Mark complete",
                        variant: .outline,
                        size: .sm,
                        isLoading: isSaving,
                        isFullWidth: false,
                        action: onComplete
                    )
                }
            }
        }
    }
}

private struct NewTaskSheet: View {
    let clinicId: UUID?
    let ownerUserId: UUID?
    let onCreated: (CareTask) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var patients: [Patient] = []
    @State private var consultations: [Consultation] = []
    @State private var selectedPatientId: UUID?
    @State private var selectedConsultationId: UUID?
    @State private var title = ""
    @State private var description = ""
    @State private var selectedCategory: CareTaskCategory = .followUp
    @State private var includeDueDate = false
    @State private var dueDate = Date()
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        Text("Create a manual task")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(Theme.primary)
                        Text("Manual tasks stay tied to a patient and consultation so follow-up work has the right clinical context.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }

                    if let errorMessage {
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundStyle(Theme.error)
                    }

                    CSCard {
                        VStack(alignment: .leading, spacing: Theme.spacingMd) {
                            Picker("Patient", selection: $selectedPatientId) {
                                Text("Select a patient").tag(UUID?.none)
                                ForEach(patients) { patient in
                                    Text(patient.fullName).tag(Optional(patient.id))
                                }
                            }
                            .pickerStyle(.menu)

                            Picker("Consultation", selection: $selectedConsultationId) {
                                Text(consultations.isEmpty ? "Select a patient first" : "Select a consultation").tag(UUID?.none)
                                ForEach(consultations) { consultation in
                                    Text("\(consultation.consultationType) • \(DateFormatters.formatDateOnly(consultation.startedAt))")
                                        .tag(Optional(consultation.id))
                                }
                            }
                            .pickerStyle(.menu)
                            .disabled(selectedPatientId == nil || consultations.isEmpty)
                        }
                    }

                    CSCard {
                        VStack(spacing: Theme.spacingMd) {
                            CSTextField(label: "Task title", text: $title, placeholder: "Call patient with results")
                            CSTextField(label: "Description", text: $description, placeholder: "Optional detail")

                            Picker("Category", selection: $selectedCategory) {
                                ForEach(CareTaskCategory.allCases, id: \.self) { category in
                                    Text(category.label).tag(category)
                                }
                            }
                            .pickerStyle(.menu)

                            Toggle("Add due date", isOn: $includeDueDate)

                            if includeDueDate {
                                DatePicker("Due date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                            }
                        }
                    }
                }
                .padding(Theme.spacingLg)
            }
            .background(Theme.surface)
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task { await saveTask() }
                    }
                    .disabled(!canSave || isSaving)
                }
            }
            .task {
                await loadPatients()
            }
            .onChange(of: selectedPatientId) { _, newValue in
                selectedConsultationId = nil
                consultations = []

                guard newValue != nil else { return }
                Task { await loadConsultations() }
            }
        }
    }

    private var canSave: Bool {
        clinicId != nil
            && selectedPatientId != nil
            && selectedConsultationId != nil
            && !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func loadPatients() async {
        guard let clinicId else { return }

        do {
            patients = try await PatientService.shared.getPatients(clinicId: clinicId)
        } catch {
            errorMessage = "Failed to load patients: \(error.localizedDescription)"
        }
    }

    private func loadConsultations() async {
        guard let clinicId, let selectedPatientId else { return }

        do {
            consultations = try await ConsultationService.shared.getConsultationsForPatient(
                clinicId: clinicId,
                patientId: selectedPatientId
            )
        } catch {
            errorMessage = "Failed to load consultations: \(error.localizedDescription)"
        }
    }

    private func saveTask() async {
        guard let clinicId, let patientId = selectedPatientId, let consultationId = selectedConsultationId else {
            errorMessage = "Select a patient and consultation before saving."
            return
        }

        isSaving = true
        errorMessage = nil

        do {
            let task = try await CareTaskService.shared.createTask(
                CareTaskService.CreateTaskInput(
                    clinic_id: clinicId,
                    patient_id: patientId,
                    consultation_id: consultationId,
                    title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.trimmingCharacters(in: .whitespacesAndNewlines),
                    due_at: includeDueDate ? DateFormatters.iso8601.string(from: dueDate) : nil,
                    status: .open,
                    category: selectedCategory,
                    owner_user_id: ownerUserId,
                    source: "manual"
                )
            )

            onCreated(task)
            dismiss()
        } catch {
            errorMessage = "Failed to create task: \(error.localizedDescription)"
        }

        isSaving = false
    }
}
