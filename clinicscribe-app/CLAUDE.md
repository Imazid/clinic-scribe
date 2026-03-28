# ClinicScribe AI — Web App Guide

## Build & Run
```bash
npm run dev    # http://localhost:3000
npm run build  # Production build
npm run lint   # ESLint
```

## Architecture

### Tech Stack
- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS
- Supabase (auth via `@supabase/ssr`, database via `@supabase/supabase-js`)
- Stripe (billing)
- Anthropic SDK (note generation)
- OpenAI SDK (transcription via Deepgram)
- Framer Motion (animations)
- `@react-pdf/renderer` (PDF export)

### Route Groups
- `(auth)/` — Login, signup, forgot-password, auth callback
- `(app)/` — Authenticated app screens (layout with sidebar)
- `api/` — API routes

### App Screens (`src/app/(app)/`)
| Route | Purpose |
|-------|---------|
| `/dashboard` | Metrics, recent consultations, quick actions |
| `/patients` | Patient list with search/filter |
| `/patients/[id]` | Patient detail + timeline |
| `/patients/new`, `/patients/[id]/edit` | Patient create/edit |
| `/consultations` | Consultation list with status filter |
| `/consultations/new` | New consultation + audio recording |
| `/consultations/[id]` | Consultation detail + transcript |
| `/consultations/[id]/review` | SOAP note review + approve |
| `/analytics` | Charts, approval rate, consultation stats |
| `/audit` | Audit log with search |
| `/integrations` | Integration status cards |
| `/settings` | Settings hub |
| `/settings/profile` | Edit profile |
| `/settings/billing` | Subscription management |
| `/checkout` | Stripe checkout |

### API Routes (`src/app/api/`)
| Route | Purpose |
|-------|---------|
| `/api/transcribe` | Audio → transcript (Deepgram) |
| `/api/generate-note` | Transcript → SOAP note (Anthropic) |
| `/api/deepgram-token` | Deepgram auth token for live transcription |
| `/api/export-pdf` | Generate PDF from clinical note |
| `/api/stripe/create-checkout` | Create Stripe checkout session |
| `/api/stripe/portal` | Create Stripe billing portal session |
| `/api/stripe/webhook` | Stripe webhook handler |

### Key Files
- `src/lib/types.ts` — All TypeScript types/interfaces (SINGLE SOURCE OF TRUTH for data models)
- `src/lib/constants.ts` — App constants, consultation types, integration list
- `src/lib/stripe.ts` — Stripe config, plan definitions
- `src/app/globals.css` — Design tokens via Tailwind @theme
- `src/lib/supabase/` — Supabase client (server + browser)

### Database
Supabase with RLS. Tables: clinics, profiles, patients, consultations, audio_recordings, transcripts, clinical_notes, audit_logs, note_templates, export_records.

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
