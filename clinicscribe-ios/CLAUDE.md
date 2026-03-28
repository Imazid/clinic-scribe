# ClinicScribe AI — iOS App Guide

## Build & Run
```bash
xcodebuild -project "ClinicScribe.xcodeproj" -scheme "ClinicScribe" -sdk iphonesimulator -destination "platform=iOS Simulator,name=iPhone 17" build
```

## Architecture

### Project Structure
- **Xcode 16+** auto-discovered sources (`objectVersion = 77`)
- Deployment target: iOS 17.0
- Bundle ID: `com.clinicscribe.ios`
- SPM dependency: `supabase-swift` v2

### Pattern: MVVM
- `Views/` — SwiftUI views organized by feature (Auth, Dashboard, Patients, Consultations, Notes, Analytics, Audit, Settings, Integrations)
- `ViewModels/` — `@MainActor ObservableObject` classes, one per screen
- `Services/` — Singleton service classes for data operations
- `Models/` — Codable structs with `CodingKeys` for snake_case Supabase columns
- `Design/` — `Theme.swift` design tokens + `Components/` reusable UI (prefixed `CS`)

### Shared Backend
Uses the **same Supabase project** as the web app (`clinicscribe-app`). No separate backend.

| Concern | How |
|---------|-----|
| Auth | Supabase Swift SDK — email/password, Google OAuth |
| Database | Supabase Swift SDK — PostgREST with RLS |
| Storage | Supabase Swift SDK — `audio-recordings` bucket |
| Transcription | HTTP POST to web app `/api/transcribe` |
| Note Generation | HTTP POST to web app `/api/generate-note` |
| PDF Export | HTTP POST to web app `/api/export-pdf` |
| Billing | SFSafariViewController → Stripe Checkout/Portal URLs |

### Config
- `Config/Secrets.plist` — **gitignored**, contains SupabaseURL, SupabaseAnonKey, APIBaseURL
- `Config/Secrets.plist.example` — template for developers
- `Config/AppConfig.swift` — loads Secrets.plist, defines constants

### Design System — "The Curated Sanctuary"
Ported from web CSS custom properties to SwiftUI in `Design/Theme.swift`:
- Primary (Deep Navy): `#001736`
- Secondary (Medical Teal): `#006876`
- Surface (Warm Cream): `#FCF9F4`
- Rules: no 1px borders, no pure black, no sharp corners, tonal layering

### Navigation
5-tab `TabView`: Dashboard, Patients, Consultations, Analytics, More (Settings/Integrations/Audit/Sign Out)

### Key Services
| Service | Purpose |
|---------|---------|
| `SupabaseManager` | Singleton Supabase client |
| `AuthService` | Auth state, sign in/up/out, profile |
| `APIClient` | HTTP client for Next.js API routes (Bearer token) |
| `PatientService` | Patient CRUD |
| `ConsultationService` | Consultation CRUD + status updates |
| `AudioService` | AVFoundation recording + Supabase Storage upload |
| `TranscriptionService` | Upload audio → transcribe → store |
| `NoteGenerationService` | Generate SOAP note → store |
| `AuditService` | Insert/query audit logs |
| `BillingService` | Stripe checkout/portal URLs |
| `ExportService` | Copy to clipboard |

## Content Constraints (Healthcare)
- AI-generated notes MUST be described as "clinician-reviewed before finalisation"
- Prescription support = "drafting assistance" only
- NO "revolutionary", "replace doctors", "fully autonomous"
- PREFER "draft", "assist", "review", "validate", "approve"

---

## Cross-Platform Parallel Development

Three platforms share one backend:
- **Web**: `~/Desktop/clinicscribe-app/` (Next.js)
- **iOS**: `~/Desktop/clinicscribe-ios/` (SwiftUI)
- **Marketing**: `~/Desktop/clinicscribe-website/` (Next.js)

### MANDATORY: When changing ANY of these, update ALL platforms:

| Change Type | Web File | iOS File |
|------------|----------|----------|
| Data model | `src/lib/types.ts` | `Models/*.swift` |
| Enum values | `src/lib/types.ts` | `Models/Enums.swift` |
| Constants | `src/lib/constants.ts` | `Config/AppConfig.swift` |
| New API route | `src/app/api/...` | `Services/APIClient.swift` + relevant service |
| New screen | `src/app/(app)/...` | `Views/...` + ViewModel |
| Design tokens | `src/app/globals.css` | `Design/Theme.swift` |
| Pricing tiers | `src/lib/stripe.ts` | `Services/BillingService.swift` |
| Consultation types | constants | `AppConfig.consultationTypes` |
| Auth flow change | middleware + login | `AuthService.swift` + `AuthViewModel.swift` |

### Checklist before completing any feature:
1. Is the data model identical on web and iOS?
2. Are enum values in sync?
3. Do constants (consultation types, status labels, etc.) match?
4. If a new API route was added, does the iOS APIClient know about it?
5. If UI copy changed, is it updated on both platforms?
