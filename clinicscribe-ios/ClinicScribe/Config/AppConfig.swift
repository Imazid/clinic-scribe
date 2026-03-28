import Foundation

struct AppConfig {
    static let shared = AppConfig()

    let supabaseURL: String
    let supabaseAnonKey: String
    let apiBaseURL: String

    // Consultation types — must match clinicscribe-app/src/lib/constants.ts
    static let consultationTypes = [
        "Standard Consultation",
        "Telehealth",
        "Follow-up",
        "Procedure",
        "Mental Health",
        "Chronic Disease Management",
        "Health Assessment",
    ]

    static let audioMaxFileSizeMB = 24
    static let audioSampleRate: Double = 16000
    static let audioChannels: Int = 1

    static let confidenceThresholdHigh: Double = 0.9
    static let confidenceThresholdMedium: Double = 0.7

    private init() {
        if let path = Bundle.main.path(forResource: "Secrets", ofType: "plist"),
           let dict = NSDictionary(contentsOfFile: path) as? [String: Any] {
            supabaseURL = dict["SupabaseURL"] as? String ?? ""
            supabaseAnonKey = dict["SupabaseAnonKey"] as? String ?? ""
            apiBaseURL = dict["APIBaseURL"] as? String ?? "http://localhost:3000"
        } else {
            print("⚠️ Missing Config/Secrets.plist — copy Secrets.plist.example and fill in your keys")
            supabaseURL = ""
            supabaseAnonKey = ""
            apiBaseURL = "http://localhost:3000"
        }
    }
}
