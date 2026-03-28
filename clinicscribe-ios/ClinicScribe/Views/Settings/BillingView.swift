import SwiftUI
import SafariServices

struct BillingView: View {
    let clinic: Clinic?
    @StateObject private var vm = BillingViewModel()
    @State private var safariURL: URL?

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.spacingLg) {
                if let clinic {
                    // MARK: - Current Plan Card
                    VStack(spacing: Theme.spacingMd) {
                        Text(clinic.subscriptionTier.rawValue.capitalized)
                            .font(.title.weight(.bold))
                            .foregroundStyle(Theme.onSurface)

                        CSBadge(
                            text: clinic.stripeSubscriptionStatus.capitalized,
                            variant: clinic.stripeSubscriptionStatus == "active" ? .success : .warning
                        )

                        Divider()
                            .padding(.vertical, Theme.spacingXS)

                        VStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                            billingInfoRow(label: "Seats", value: "\(clinic.subscriptionSeats)")

                            if let end = clinic.subscriptionPeriodEnd {
                                billingInfoRow(label: "Renews", value: DateFormatters.formatDateOnly(end))
                            }

                            if let trial = clinic.trialEndsAt {
                                billingInfoRow(label: "Trial Ends", value: DateFormatters.formatDateOnly(trial))
                            }
                        }
                    }
                    .cardStyle()

                    // MARK: - Actions
                    VStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                        if clinic.stripeSubscriptionId != nil {
                            CSButton(
                                title: "Manage Subscription",
                                variant: .primary,
                                isLoading: vm.isLoading
                            ) {
                                Task {
                                    if let url = await vm.openPortal() {
                                        safariURL = url
                                    }
                                }
                            }
                            .disabled(vm.isLoading)
                        } else {
                            NavigationLink {
                                CheckoutView()
                            } label: {
                                Text("Choose a Plan")
                                    .font(.body.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .padding(.horizontal, 20)
                                    .foregroundStyle(Theme.primary)
                                    .background(.clear)
                                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                                    .overlay {
                                        RoundedRectangle(cornerRadius: Theme.radiusMd)
                                            .stroke(Theme.outline, lineWidth: 1)
                                    }
                            }
                        }
                    }

                    if let error = vm.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(Theme.error)
                            .padding(Theme.spacingSm)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Theme.errorContainer.opacity(0.3))
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
                            .accessibilityLabel("Error: \(error)")
                    }
                } else {
                    CSEmptyState(
                        icon: "creditcard.trianglebadge.exclamationmark",
                        title: "No Active Plan",
                        description: "You don't have an active subscription yet. Choose a plan to get started.",
                        actionTitle: "Choose a Plan"
                    ) {
                        // Navigation handled via NavigationLink below
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, Theme.spacingXL)

                    NavigationLink {
                        CheckoutView()
                    } label: {
                        Text("Browse Plans")
                            .font(.body.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .padding(.horizontal, 20)
                            .foregroundStyle(Theme.onPrimary)
                            .background(Theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    }
                }
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("Billing")
        .sheet(item: $safariURL) { url in
            SafariView(url: url)
                .ignoresSafeArea()
        }
    }

    private func billingInfoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(Theme.onSurfaceVariant)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.onSurface)
        }
    }
}

// Make URL conform to Identifiable for sheet presentation
extension URL: @retroactive Identifiable {
    public var id: String { absoluteString }
}

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ vc: SFSafariViewController, context: Context) {}
}
