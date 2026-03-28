import SwiftUI

struct ConsultationListView: View {
    @StateObject private var vm = ConsultationListViewModel()
    @ObservedObject private var auth = AuthService.shared

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                VStack(spacing: Theme.spacingSm) {
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

                // Error banner with retry
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
                    // Loading skeleton: 5 placeholder rows
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
                        description: "Start your first consultation",
                        actionTitle: "New Consultation"
                    ) {
                        // Navigate handled via NavigationLink below
                    }
                    .frame(maxHeight: .infinity)
                    .overlay {
                        NavigationLink {
                            NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
                        } label: {
                            Color.clear
                        }
                        .opacity(0)
                        .allowsHitTesting(false)
                    }
                    // Overlay a visible navigation button
                    .overlay(alignment: .bottom) {
                        NavigationLink {
                            NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
                        } label: {
                            Text("New Consultation")
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
                    List(vm.filteredConsultations) { c in
                        NavigationLink(value: c.id) {
                            ConsultationRow(consultation: c)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .background(Theme.surface)
            .navigationTitle("Consultations")
            .toolbar {
                NavigationLink {
                    NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
                } label: {
                    Image(systemName: "plus")
                        .accessibilityLabel("New consultation")
                }
            }
            .navigationDestination(for: UUID.self) { id in
                ConsultationDetailView(consultationId: id)
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
    }
}

// MARK: - Skeleton Row

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

// MARK: - Consultation Row

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
                Text("\(consultation.consultationType) - \(DateFormatters.formatISO(consultation.startedAt))")
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
