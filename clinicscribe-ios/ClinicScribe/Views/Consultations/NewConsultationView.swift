import SwiftUI

struct NewConsultationView: View {
    var clinicId: UUID?
    var clinicianId: UUID?

    @StateObject private var vm = NewConsultationViewModel()
    @StateObject private var audioService = AudioService()

    @State private var createdConsultation: Consultation?
    @State private var templates: [NoteTemplate] = NoteTemplateCatalog.allTemplates
    @State private var selectedTemplate = NoteTemplateCatalog.defaultTemplate
    @State private var isPresentingTemplatePicker = false
    @State private var isLoadingTemplates = true
    @State private var hasManualTemplateSelection = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                CSPageHeader(title: "New Capture Session", subtitle: "Choose the patient, lock the template, then move straight into capture.")

                patientSection
                consultationTypeSection
                templateSection
                recordingSection
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("New Capture Session")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            vm.clinicId = clinicId
            vm.clinicianId = clinicianId
            await loadInitialData()
        }
        .onChange(of: vm.consultationType) { _, newValue in
            guard !hasManualTemplateSelection else { return }
            selectedTemplate = NoteTemplateCatalog.suggestedTemplate(for: newValue, templates: templates)
        }
    }

    private var patientSection: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text("Patient")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.onSurface)

            CSSearchBar(text: $vm.patientSearch, placeholder: "Search patients...")

            PatientSelectionList(vm: vm)
        }
    }

    private var consultationTypeSection: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text("Consultation Type")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.onSurface)

            Picker("Type", selection: $vm.consultationType) {
                ForEach(AppConfig.consultationTypes, id: \.self) { type in
                    Text(type).tag(type)
                }
            }
            .pickerStyle(.menu)
            .padding(Theme.spacingMd)
            .background(Theme.surfaceContainerLow)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
        }
    }

    private var templateSection: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text("Template")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.onSurface)

            if isLoadingTemplates {
                ProgressView("Loading templates...")
                    .padding(.vertical, Theme.spacingMd)
            } else {
                NoteTemplateSelectionCard(
                    title: "Selected template",
                    template: selectedTemplate,
                    helperText: "Choose the structure you want the generated note to keep through capture and verification.",
                    actionTitle: "Browse templates"
                ) {
                    isPresentingTemplatePicker = true
                }
            }
        }
        .sheet(isPresented: $isPresentingTemplatePicker) {
            NoteTemplatePickerView(
                title: "Choose Template",
                templates: templates,
                selectedTemplate: $selectedTemplate
            )
            .presentationDetents([.large])
            .onDisappear {
                hasManualTemplateSelection = true
            }
        }
    }

    @ViewBuilder
    private var recordingSection: some View {
        if let consultation = createdConsultation {
            AudioRecorderView(
                consultation: consultation,
                audioService: audioService,
                selectedTemplate: selectedTemplate
            )
        } else {
            CSCard {
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    Text("Ready to start")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)

                    Text(vm.selectedPatientId == nil
                         ? "Choose a patient before creating the session."
                         : "Create the session first, then record directly into the workspace.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)

                    if let error = vm.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(Theme.error)
                    }

                    CSButton(
                        title: "Create Session",
                        isLoading: vm.isCreating
                    ) {
                        Task {
                            if let consultation = await vm.createConsultation(templateKey: selectedTemplate.id) {
                                createdConsultation = consultation
                            }
                        }
                    }
                    .disabled(vm.selectedPatientId == nil || isLoadingTemplates)
                }
            }
        }
    }

    private func loadInitialData() async {
        selectedTemplate = NoteTemplateCatalog.suggestedTemplate(for: vm.consultationType)
        await vm.loadPatients()

        isLoadingTemplates = true
        let loadedTemplates = (try? await TemplateLibraryService.shared.loadTemplates(clinicId: clinicId)) ?? NoteTemplateCatalog.allTemplates
        templates = loadedTemplates
        selectedTemplate = NoteTemplateCatalog.suggestedTemplate(for: vm.consultationType, templates: loadedTemplates)
        isLoadingTemplates = false
    }
}

private struct PatientSelectionList: View {
    @ObservedObject var vm: NewConsultationViewModel

    var body: some View {
        if !vm.filteredPatients.isEmpty {
            ForEach(vm.filteredPatients.prefix(5)) { patient in
                PatientSelectionRow(patient: patient, isSelected: vm.selectedPatientId == patient.id) {
                    vm.selectedPatientId = patient.id
                    vm.patientSearch = patient.fullName
                }
            }
        } else if vm.patientSearch.isEmpty {
            emptyState
        }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.spacingSm) {
            Image(systemName: "person.crop.circle.badge.questionmark")
                .font(.title2)
                .foregroundStyle(Theme.onSurfaceVariant)
                .accessibilityHidden(true)
            Text("No patients found. Add a patient first.")
                .font(.subheadline)
                .foregroundStyle(Theme.onSurfaceVariant)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.spacingMd)
    }
}

private struct PatientSelectionRow: View {
    let patient: Patient
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack {
                CSAvatar(initials: patient.initials, size: 32)
                Text(patient.fullName).foregroundStyle(Theme.onSurface)
                Spacer()
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(Theme.success)
                        .accessibilityHidden(true)
                }
            }
            .padding(Theme.spacingSm)
            .background(isSelected ? Theme.successContainer.opacity(0.3) : .clear)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(patient.fullName)\(isSelected ? ", selected" : "")")
    }
}
