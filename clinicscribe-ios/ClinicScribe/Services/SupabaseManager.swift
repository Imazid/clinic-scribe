import Foundation
import Supabase

@MainActor
final class SupabaseManager {
    static let shared = SupabaseManager()
    let client: SupabaseClient

    private init() {
        let config = AppConfig.shared
        let url = URL(string: config.supabaseURL) ?? URL(string: "https://placeholder.supabase.co")!
        client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: config.supabaseAnonKey
        )
    }
}
