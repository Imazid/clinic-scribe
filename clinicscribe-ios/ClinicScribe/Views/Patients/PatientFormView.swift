import SwiftUI

/// `PatientFormView` — pixel-faithful to the design package's
/// `NewPatientScreen`: hero strip, sectioned form with icon + eyebrow + title
/// + sub headers, hint microcopy, contextual error banners. Same VM and save
/// pipeline as before — visual only.
struct PatientFormView: View {
    var clinicId: UUID?
    var editPatient: Patient? = nil

    @StateObject private var vm = PatientFormViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                hero

                if let error = vm.errorMessage {
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(Theme.error)
                        Text(error)
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.onSurface)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.radiusMd)
                            .fill(Theme.error.opacity(0.08))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radiusMd)
                            .strokeBorder(Theme.error.opacity(0.30), lineWidth: 1)
                    )
                }

                identitySection
                contactSection
                identifiersSection
                clinicalSection
                notesSection

                CSButton(
                    title: editPatient != nil ? "Save changes" : "Add patient",
                    size: .lg,
                    isLoading: vm.isLoading,
                    isFullWidth: true
                ) {
                    Task {
                        if await vm.save() != nil { dismiss() }
                    }
                }

                Text("By adding a patient, you confirm you have authority to store their clinical data in this clinic.")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                    .padding(.bottom, 8)
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle(editPatient != nil ? "Edit patient" : "New patient")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            vm.clinicId = clinicId
            if let p = editPatient { vm.populateForEdit(p) }
        }
    }

    // MARK: - Hero

    private var hero: some View {
        CSHeroStrip(
            eyebrow: editPatient != nil ? "EDIT PATIENT" : "NEW PATIENT",
            title: {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(editPatient != nil ? "Update the" : "Set up the")
                    CSHeroAccent("record.")
                }
            },
            description: editPatient != nil
                ? "Adjust identifiers and clinical context. Existing consultations and notes stay linked."
                : "Capture the basics now — you can fill in the rest after the first consult."
        )
    }

    // MARK: - Sections

    private var identitySection: some View {
        FormSection(
            eyebrow: "01",
            title: "Identity",
            sub: "Required for every patient record.",
            icon: "person.crop.circle"
        ) {
            HStack(alignment: .top, spacing: 10) {
                CSTextField(label: "First name", text: $vm.firstName, placeholder: "Jane")
                CSTextField(label: "Last name", text: $vm.lastName, placeholder: "Smith")
            }

            if editPatient == nil {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Date of birth")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Theme.onSurfaceVariant)
                    DatePicker("", selection: $vm.dateOfBirth, displayedComponents: .date)
                        .labelsHidden()
                        .datePickerStyle(.compact)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.radiusMd)
                                .fill(Theme.surfaceContainerLowest)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radiusMd)
                                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
                        )
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Sex")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)
                Picker("Sex", selection: $vm.sex) {
                    ForEach(Sex.allCases, id: \.self) { s in
                        Text(s.label).tag(s)
                    }
                }
                .pickerStyle(.segmented)
            }
        }
    }

    private var contactSection: some View {
        FormSection(
            eyebrow: "02",
            title: "Contact",
            sub: "How to reach the patient between visits.",
            icon: "phone"
        ) {
            CSTextField(
                label: "Email",
                text: $vm.email,
                placeholder: "patient@email.com",
                keyboardType: .emailAddress
            )
            CSTextField(
                label: "Phone",
                text: $vm.phone,
                placeholder: "0400 000 000",
                keyboardType: .phonePad
            )
        }
    }

    private var identifiersSection: some View {
        FormSection(
            eyebrow: "03",
            title: "Identifiers",
            sub: "Optional — add what you have. Anything missing can be filled in later.",
            icon: "number"
        ) {
            CSTextField(label: "MRN", text: $vm.mrn, placeholder: "Medical record number")
            CSTextField(label: "Medicare number", text: $vm.medicareNumber, placeholder: "1234 56789 0")
            CSTextField(label: "IHI", text: $vm.ihi, placeholder: "Individual healthcare identifier")
        }
    }

    private var clinicalSection: some View {
        FormSection(
            eyebrow: "04",
            title: "Clinical context",
            sub: "Comma-separate items. Miraa surfaces these as flags during capture.",
            icon: "heart.text.square"
        ) {
            CSTextField(label: "Allergies", text: $vm.allergies, placeholder: "Penicillin, peanuts")
            CSTextField(label: "Active conditions", text: $vm.conditions, placeholder: "Hypertension, T2DM")
        }
    }

    private var notesSection: some View {
        FormSection(
            eyebrow: "05",
            title: "Notes",
            sub: "Free-form context only you and your team will see.",
            icon: "note.text"
        ) {
            CSTextField(label: "Notes", text: $vm.notes, placeholder: "Optional notes")
        }
    }
}

// MARK: - Section primitive

private struct FormSection<Content: View>: View {
    let eyebrow: String
    let title: String
    let sub: String
    let icon: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            HStack(alignment: .top, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Theme.secondary.opacity(0.10))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(Theme.secondary)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(eyebrow)
                        .font(.system(size: 10, weight: .bold).monospaced())
                        .tracking(0.6)
                        .foregroundStyle(Theme.outline)
                    Text(title)
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(Theme.onSurface)
                    Text(sub)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .lineLimit(2)
                }
                Spacer(minLength: 0)
            }

            VStack(alignment: .leading, spacing: 10) {
                content()
            }
            .padding(Theme.spacingMd)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: Theme.radiusLg)
                    .fill(Theme.surfaceContainerLowest)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radiusLg)
                    .strokeBorder(Theme.outlineVariant, lineWidth: 1)
            )
        }
    }
}
