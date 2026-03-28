import SwiftUI

struct NewConsultationView: View {
    var clinicId: UUID?
    var clinicianId: UUID?
    @StateObject private var vm = NewConsultationViewModel()
    @StateObject private var audioService = AudioService()
    @Environment(\.dismiss) private var dismiss
    @State private var createdConsultation: Consultation?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                CSPageHeader(title: "New Consultation")
                patientSection
                consultationTypeSection
                recordingSection
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("New Consultation")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            vm.clinicId = clinicId
            vm.clinicianId = clinicianId
            await vm.loadPatients()
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

    @ViewBuilder
    private var recordingSection: some View {
        if let consultation = createdConsultation {
            AudioRecorderView(consultation: consultation, audioService: audioService)
        } else {
            VStack(spacing: Theme.spacingSm) {
                if let error = vm.errorMessage {
                    Text(error).font(.caption).foregroundStyle(Theme.error)
                }

                CSButton(title: "Start Consultation", isLoading: vm.isCreating) {
                    Task {
                        if let c = await vm.createConsultation() {
                            createdConsultation = c
                        }
                    }
                }
            }
        }
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
