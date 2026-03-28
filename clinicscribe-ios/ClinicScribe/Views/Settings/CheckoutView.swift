import SwiftUI

struct CheckoutView: View {
    @StateObject private var vm = BillingViewModel()
    @State private var safariURL: URL?

    private let plans: [(id: String, name: String, price: String, description: String)] = [
        ("solo", "Solo", "$49/mo", "For individual practitioners"),
        ("clinic", "Clinic", "$149/mo", "For small to mid-size clinics"),
        ("group", "Group Practice", "$349/mo", "For multi-location practices"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.spacingMd) {
                ForEach(plans, id: \.id) { plan in
                    PlanCard(
                        plan: plan,
                        isSelected: vm.selectedPlan == plan.id,
                        onSelect: { vm.selectedPlan = plan.id }
                    )
                }

                if vm.selectedPlan == "clinic" || vm.selectedPlan == "group" {
                    Stepper("Seats: \(vm.seats)", value: $vm.seats, in: 1...100)
                        .padding()
                        .background(Theme.surfaceContainerLowest)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                }

                CSButton(title: "Start Free Trial", variant: .primary) {
                    Task {
                        if let url = await vm.openCheckout() {
                            safariURL = url
                        }
                    }
                }
                .disabled(vm.isLoading)
                .padding(.top, Theme.spacingSm)

                Text("14-day free trial — your card won't be charged until it ends")
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)

                if let error = vm.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(Theme.error)
                }
            }
            .padding()
        }
        .background(Theme.surface)
        .navigationTitle("Choose a Plan")
        .sheet(item: $safariURL) { url in
            SafariView(url: url)
                .ignoresSafeArea()
        }
    }
}

private struct PlanCard: View {
    let plan: (id: String, name: String, price: String, description: String)
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(plan.name)
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)
                    Text(plan.description)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }

                Spacer()

                Text(plan.price)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Theme.primary)
            }
            .padding()
            .background(isSelected ? Theme.secondaryFixed.opacity(0.15) : Theme.surfaceContainerLowest)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.radiusMd)
                    .stroke(isSelected ? Theme.secondary : Theme.outlineVariant, lineWidth: isSelected ? 2 : 1)
            }
        }
    }
}
