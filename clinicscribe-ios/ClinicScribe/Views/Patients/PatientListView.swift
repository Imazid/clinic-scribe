import SwiftUI

struct PatientListView: View {
    @StateObject private var vm = PatientListViewModel()
    @ObservedObject private var auth = AuthService.shared
    @State private var showAddPatient = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                VStack(spacing: Theme.spacingSm) {
                    CSSearchBar(text: $vm.searchText, placeholder: "Search patients...")

                    // Filter chips with gradient fades on edges
                    ZStack {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: Theme.spacingSm) {
                                CSFilterChip(title: "All", isSelected: vm.consentFilter == nil) {
                                    vm.consentFilter = nil
                                    Task { await vm.load() }
                                }
                                ForEach(ConsentStatus.allCases, id: \.self) { status in
                                    CSFilterChip(title: status.label, isSelected: vm.consentFilter == status) {
                                        vm.consentFilter = status
                                        Task { await vm.load() }
                                    }
                                }
                            }
                            .padding(.horizontal, Theme.spacingXS)
                        }

                        // Gradient fades on edges
                        HStack {
                            LinearGradient(
                                colors: [Theme.surface, Theme.surface.opacity(0)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .frame(width: Theme.spacingSm)

                            Spacer()

                            LinearGradient(
                                colors: [Theme.surface.opacity(0), Theme.surface],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .frame(width: Theme.spacingSm)
                        }
                        .allowsHitTesting(false)
                    }
                }
                .padding(Theme.spacingMd)

                // Error banner
                if let errorMessage = vm.errorMessage {
                    HStack(spacing: Theme.spacingSm) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(Theme.error)
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundStyle(Theme.onSurface)
                            .lineLimit(2)
                        Spacer()
                        Button {
                            Task { await vm.load() }
                        } label: {
                            Text("Retry")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.primary)
                        }
                    }
                    .padding(Theme.spacingSm)
                    .background(Theme.errorContainer)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
                    .padding(.horizontal, Theme.spacingMd)
                    .padding(.bottom, Theme.spacingSm)
                }

                if vm.isLoading {
                    // Loading skeleton
                    VStack(spacing: 0) {
                        ForEach(0..<5, id: \.self) { index in
                            HStack(spacing: Theme.spacingSm) {
                                Circle()
                                    .fill(Theme.surfaceContainerHigh)
                                    .frame(width: 40, height: 40)
                                VStack(alignment: .leading, spacing: Theme.spacingXS) {
                                    RoundedRectangle(cornerRadius: Theme.radiusXS)
                                        .fill(Theme.surfaceContainerHigh)
                                        .frame(width: 140, height: 16)
                                    RoundedRectangle(cornerRadius: Theme.radiusXS)
                                        .fill(Theme.surfaceContainerHigh)
                                        .frame(width: 100, height: 12)
                                }
                                Spacer()
                                RoundedRectangle(cornerRadius: Theme.radiusXS)
                                    .fill(Theme.surfaceContainerHigh)
                                    .frame(width: 80, height: 22)
                            }
                            .padding(.vertical, Theme.spacingSm)
                            .padding(.horizontal, Theme.spacingMd)
                            .redacted(reason: .placeholder)

                            if index < 4 {
                                Divider()
                                    .padding(.leading, Theme.spacingMd + 40 + Theme.spacingSm)
                            }
                        }
                    }
                    Spacer()
                } else if vm.patients.isEmpty {
                    CSEmptyState(
                        icon: "person.2.slash",
                        title: "No Patients",
                        description: "Add your first patient to get started",
                        actionTitle: "Add Patient"
                    ) {
                        showAddPatient = true
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    List(vm.patients) { patient in
                        NavigationLink(value: patient.id) {
                            PatientRow(patient: patient)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .background(Theme.surface)
            .navigationTitle("Patients")
            .toolbar {
                NavigationLink {
                    PatientFormView(clinicId: auth.clinicId)
                } label: {
                    Image(systemName: "plus")
                        .accessibilityLabel("Add patient")
                }
            }
            .navigationDestination(for: UUID.self) { id in
                PatientDetailView(patientId: id)
            }
            .navigationDestination(isPresented: $showAddPatient) {
                PatientFormView(clinicId: auth.clinicId)
            }
            .refreshable { await vm.load() }
            .task {
                vm.clinicId = auth.clinicId
                await vm.load()
            }
            .onChange(of: auth.clinicId) { _, newValue in
                vm.clinicId = newValue
                Task { await vm.load() }
            }
            .onChange(of: vm.searchText) { _, _ in
                Task { await vm.load() }
            }
        }
    }
}

private struct PatientRow: View {
    let patient: Patient

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            CSAvatar(initials: patient.initials, size: 40)

            VStack(alignment: .leading, spacing: 2) {
                Text(patient.fullName)
                    .font(.body.weight(.medium))
                    .foregroundStyle(Theme.onSurface)
                    .lineLimit(1)
                if let phone = patient.phone {
                    Text(phone)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }

            Spacer()

            CSBadge(text: patient.consentStatus.label, variant: patient.consentStatus.badgeVariant)
        }
        .padding(.vertical, Theme.spacingXS)
        .accessibilityElement(children: .combine)
    }
}
