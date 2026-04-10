import SwiftUI

enum ConsultationListDestinationMode {
    case detail
    case sessionWorkspace
    case verify
}

struct ConsultationListView: View {
    @StateObject private var vm: ConsultationListViewModel
    @ObservedObject private var auth = AuthService.shared
    let navigationTitle: String
    let helperText: String
    let destinationMode: ConsultationListDestinationMode

    private var newSessionTitle: String {
        navigationTitle == "Capture" ? "New Capture Session" : "New Consultation"
    }

    private var emptyDescription: String {
        navigationTitle == "Capture" ? "Start your first capture session" : "Start your first consultation"
    }

    init(
        navigationTitle: String = "Consultations",
        helperText: String = "Track live capture sessions and review pending notes.",
        defaultStatusFilter: ConsultationStatus? = nil,
        destinationMode: ConsultationListDestinationMode = .detail
    ) {
        self.navigationTitle = navigationTitle
        self.helperText = helperText
        self.destinationMode = destinationMode
        _vm = StateObject(wrappedValue: ConsultationListViewModel(statusFilter: defaultStatusFilter))
    }

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: Theme.spacingSm) {
                VStack(alignment: .leading, spacing: Theme.spacingXS) {
                    Text(navigationTitle)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Theme.primary)
                    Text(helperText)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                CSSearchBar(text: $vm.searchText, placeholder: "Search by patient...")

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Theme.spacingSm) {
                        CSFilterChip(title: "All", isSelected: vm.statusFilter == nil) {
                            vm.statusFilter = nil
                            Task { await vm.load() }
                        }

                        ForEach(ConsultationStatus.allCases, id: \.self) { status in
                            CSFilterChip(title: status.label, isSelected: vm.statusFilter == status) {
                                vm.statusFilter = status
                                Task { await vm.load() }
                            }
                        }
                    }
                }
            }
            .padding(Theme.spacingMd)

            if let errorMessage = vm.errorMessage {
                HStack(spacing: Theme.spacingSm) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(Theme.error)
                        .accessibilityHidden(true)
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
                List {
                    ForEach(0..<5, id: \.self) { _ in
                        SkeletonConsultationRow()
                            .listRowSeparator(.hidden)
                    }
                }
                .listStyle(.plain)
            } else if vm.filteredConsultations.isEmpty {
                CSEmptyState(
                    icon: "stethoscope",
                    title: "No Consultations",
                    description: emptyDescription,
                    actionTitle: newSessionTitle
                ) {
                    // Visible action is supplied below.
                }
                .frame(maxHeight: .infinity)
                .overlay(alignment: .bottom) {
                    NavigationLink {
                        NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
                    } label: {
                        Text(newSessionTitle)
                            .font(.subheadline.weight(.semibold))
                            .padding(.horizontal, 20)
                            .padding(.vertical, CSButtonSize.sm.verticalPadding)
                            .foregroundStyle(Theme.onPrimary)
                            .background(Theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    }
                    .padding(.bottom, Theme.spacingXL)
                }
            } else {
                List(vm.filteredConsultations) { consultation in
                    NavigationLink {
                        destinationView(for: consultation)
                    } label: {
                        ConsultationRow(consultation: consultation)
                    }
                }
                .listStyle(.plain)
            }
        }
        .background(Theme.surface)
        .navigationTitle(navigationTitle)
        .toolbar {
            NavigationLink {
                NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
            } label: {
                Image(systemName: "plus")
                    .accessibilityLabel(newSessionTitle)
            }
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
    }

    @ViewBuilder
    private func destinationView(for consultation: Consultation) -> some View {
        switch destinationMode {
        case .detail:
            ConsultationDetailView(consultationId: consultation.id)
        case .sessionWorkspace:
            ConsultationSessionWorkspaceView(consultationId: consultation.id)
        case .verify:
            ConsultationVerifyLoaderView(consultationId: consultation.id)
        }
    }
}

private struct SkeletonConsultationRow: View {
    @State private var isAnimating = false

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            Circle()
                .fill(Theme.surfaceContainerHigh)
                .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: Theme.spacingXS) {
                RoundedRectangle(cornerRadius: Theme.radiusXS)
                    .fill(Theme.surfaceContainerHigh)
                    .frame(width: 140, height: 14)
                RoundedRectangle(cornerRadius: Theme.radiusXS)
                    .fill(Theme.surfaceContainerHigh)
                    .frame(width: 100, height: 10)
            }

            Spacer()

            RoundedRectangle(cornerRadius: Theme.radiusXS)
                .fill(Theme.surfaceContainerHigh)
                .frame(width: 60, height: 20)
        }
        .padding(.vertical, Theme.spacingXS)
        .opacity(isAnimating ? 0.4 : 1.0)
        .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: isAnimating)
        .onAppear { isAnimating = true }
        .redacted(reason: .placeholder)
        .accessibilityLabel("Loading consultation")
    }
}

private struct ConsultationRow: View {
    let consultation: Consultation

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            CSAvatar(initials: consultation.patient?.initials ?? "?", size: 40)

            VStack(alignment: .leading, spacing: 2) {
                Text(consultation.patient?.fullName ?? "Unknown Patient")
                    .font(.body.weight(.medium))
                    .foregroundStyle(Theme.onSurface)
                    .lineLimit(1)
                Text("\(consultation.consultationType) • \(DateFormatters.formatISO(consultation.startedAt))")
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .lineLimit(1)
            }

            Spacer()

            CSBadge(text: consultation.status.label, variant: consultation.status.badgeVariant)
                .fixedSize()
        }
        .padding(.vertical, Theme.spacingXS)
        .accessibilityElement(children: .combine)
    }
}
