import SwiftUI

struct PatientFormView: View {
    var clinicId: UUID?
    var editPatient: Patient? = nil
    @StateObject private var vm = PatientFormViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.spacingMd) {
                CSPageHeader(title: editPatient != nil ? "Edit Patient" : "New Patient")

                HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                    CSTextField(label: "First Name", text: $vm.firstName, placeholder: "Jane")
                    CSTextField(label: "Last Name", text: $vm.lastName, placeholder: "Smith")
                }

                if editPatient == nil {
                    DatePicker("Date of Birth", selection: $vm.dateOfBirth, displayedComponents: .date)
                        .font(.subheadline)
                }

                Picker("Sex", selection: $vm.sex) {
                    ForEach(Sex.allCases, id: \.self) { s in
                        Text(s.label).tag(s)
                    }
                }
                .pickerStyle(.segmented)

                CSTextField(label: "Email", text: $vm.email, placeholder: "patient@email.com", keyboardType: .emailAddress)
                CSTextField(label: "Phone", text: $vm.phone, placeholder: "0400 000 000", keyboardType: .phonePad)
                CSTextField(label: "MRN", text: $vm.mrn, placeholder: "Medical Record Number")
                CSTextField(label: "Medicare Number", text: $vm.medicareNumber, placeholder: "1234 56789 0")
                CSTextField(label: "IHI", text: $vm.ihi, placeholder: "Individual Healthcare Identifier")
                CSTextField(label: "Allergies", text: $vm.allergies, placeholder: "Comma separated")
                CSTextField(label: "Conditions", text: $vm.conditions, placeholder: "Comma separated")
                CSTextField(label: "Notes", text: $vm.notes, placeholder: "Optional notes")

                if let error = vm.errorMessage {
                    Text(error).font(.caption).foregroundStyle(Theme.error)
                }

                CSButton(title: editPatient != nil ? "Save Changes" : "Add Patient", isLoading: vm.isLoading) {
                    Task {
                        if let _ = await vm.save() {
                            dismiss()
                        }
                    }
                }
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle(editPatient != nil ? "Edit Patient" : "New Patient")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            vm.clinicId = clinicId
            if let p = editPatient { vm.populateForEdit(p) }
        }
    }
}
