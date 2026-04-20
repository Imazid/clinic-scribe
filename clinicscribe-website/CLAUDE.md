# ClinicScribe AI — Project Guide

## Brand
- **Name**: Miraa (Medical Insights, Record, Automation and Assistance)
- **Domain**: `miraahealth.com` (live website domain)
- **Tagline**: "Clinical Workflow Copilot"
- **Positioning**: AI clinical documentation copilot / ambient clinical scribe
- **Resend**: Domain `miraahealth.com` is verified — from address `onboarding@miraahealth.com`

## Architecture

### Project Structure
```
clinicscribe-website/     ← Next.js 15 marketing website
clinicscribe-app/         ← Next.js 16 web app (Supabase backend)
clinicscribe-ios/         ← SwiftUI iOS app (shared Supabase backend)
```

### Website Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4 (CSS-based @theme config)
- Framer Motion
- Lucide React icons
- Plus Jakarta Sans (Google Fonts)

### iOS App Tech Stack
- SwiftUI (iOS 17+)
- Supabase Swift SDK v2
- MVVM architecture
- Shared Supabase backend with web app

## Design System — Miraa (Warm Clinical Confidence)

### Palette Philosophy
Warm cream surfaces, deep espresso ink for trust, slate blue + turquoise accents. Not cold-tech blue.

### Colors
- Primary (Espresso Ink): `#1F1A14` — headlines, primary buttons, logo
- Primary Container: `#3A2E22` — hover states, gradients
- Secondary (Slate Blue): `#2F5A7A` — links, focus rings, active nav, accents
- Secondary Container: `#C8DCEA` — soft fills, info chips
- Secondary Fixed: `#E4EEF5` — hover backgrounds, chips
- Tertiary (Turquoise): `#2E9A93` — highlights, badges, editorial accents
- Surface (Warm Cream): `#FCF9F4` — page background
- Surface Container Low: `#F6F1E8`
- Surface Container: `#F0EADD`
- Surface Container High: `#EBE3D2`
- On Surface: `#1F1A14`
- On Surface Variant: `#5C5247` — secondary text
- Outline: `#8B7F70` — muted text, disabled icons
- Outline Variant: `#D8CFBE` — hairline rules, borders
- Success (Sage): `#4F7A3A`
- Warning (Honey): `#C98600`
- Error (Warm Red): `#B83A26`

### Typography
- **Plus Jakarta Sans** (200–800): UI, headings, body (95% of system)
- **Fraunces** (italic, 500): editorial accent inside hero headlines only
- Labels: UPPERCASE, 0.1em letter-spacing, 11px, font-weight 700
- Headlines: primary color, tight tracking (`-0.02em`)
- Body: 15px, on-surface-variant for readability
- **Sentence case** everywhere except eyebrow `.label-text`

### Shadows (Warm — espresso-tinted)
- `shadow-ambient-sm`: `0 8px 20px rgba(58, 46, 34, 0.04)`
- `shadow-ambient`: `0 20px 40px rgba(58, 46, 34, 0.06)`
- `shadow-ambient-lg`: `0 30px 60px rgba(58, 46, 34, 0.08)`

### Rules
- NO 1px solid borders for sectioning — use background color shifts
- NO pure black (#000) — use on-surface (`#1F1A14`)
- NO sharp 90-degree corners — minimum 0.5rem radius
- NO drop shadows on buttons — use tonal contrast + `hover:-translate-y-px`
- Rounded cards with ambient espresso-tinted shadows
- Tonal layering for depth, not structural shadows
- NO emoji in product UI, marketing copy, or notifications
- Lucide icons exclusively (lucide-react)
- Cards: white surface (`#FFF`), radius-lg (24), shadow-ambient-sm resting
- Buttons: hover lifts 1px, no scale-down (too playful for clinical)
- Glass nav: `rgba(255,255,255,0.78)` + `blur(20px)` when scrolled

## Content Constraints (Healthcare)
- AI-generated notes MUST be described as "clinician-reviewed before finalisation"
- Prescription support = "drafting assistance" only, NEVER "autonomous prescribing"
- NO "revolutionary", "replace doctors", "fully autonomous", "diagnose instantly"
- PREFER "draft", "assist", "review", "validate", "approve", "export", "traceable"
- Safety, traceability, and workflow integration are core value props
- Australia-first compliance posture

## Genie Solutions Integration

### Overview
FHIR R4 integration with Magentus Genie — Australia's leading specialist PMS (2,000+ practices, 13,500+ practitioners). OAuth2 client credentials auth, data hosted in AWS Australia.

### Service Layer (`src/lib/genie/`)
- `types.ts` — FHIR R4 types: Patient, Practitioner, Appointment, Condition, Observation, AllergyIntolerance, DocumentReference, Encounter
- `client.ts` — `GenieClient` class: OAuth2 auth with auto-retry, pull and push methods
- `index.ts` — Singleton factory via env vars

### API Routes (`src/app/api/genie/`)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/genie/patients` | GET | Search patients |
| `/api/genie/patients/[id]` | GET | Get patient by ID |
| `/api/genie/patients/[id]/summary` | GET | Full patient context (demographics + conditions + allergies + observations) |
| `/api/genie/appointments` | GET | Search appointments |
| `/api/genie/practitioners` | GET | Search practitioners |
| `/api/genie/clinical-notes` | POST | Push approved notes/referrals/discharge summaries |
| `/api/genie/status` | GET | Config health check |

### Pull capabilities
Patient demographics, appointments, conditions, allergies, observations, encounters, practitioners

### Push capabilities
Clinical notes, referral letters, discharge summaries, correspondence (all as FHIR DocumentReference)

### Env Config
Copy `.env.example` → `.env.local` and fill in credentials from Magentus Developer Portal:
- `GENIE_CLIENT_ID`, `GENIE_CLIENT_SECRET`, `GENIE_FHIR_BASE_URL`, `GENIE_TOKEN_URL`, `GENIE_PRACTICE_ID` (optional)

### Marketing Pages
- `/integrations` — Genie featured section with pull/push cards, data flow, security
- `/integrations/genie` — Dedicated detail page with reach stats, FHIR resource table, setup guide
- Genie integration data defined in `GENIE_INTEGRATION` constant in `src/lib/constants.ts`

## Key Files
- `src/lib/constants.ts` — Brand, navigation, content, Genie integration data (SINGLE SOURCE OF TRUTH)
- `src/lib/genie/` — Genie FHIR service layer
- `src/app/globals.css` — Design tokens via Tailwind @theme
- `src/components/layout/Navbar.tsx` — Site navigation
- `src/components/layout/Footer.tsx` — Site footer
- `src/app/page.tsx` — Homepage (most important page)
- `src/app/demo/page.tsx` — Demo request form (conversion page)
- `src/app/integrations/page.tsx` — Integrations page (Genie featured)
- `src/app/integrations/genie/page.tsx` — Dedicated Genie page
- `.env.example` — Genie credential template

## Build & Run
```bash
npm run dev    # http://localhost:3000
npm run build  # Production build (use without --turbopack if sandbox issues)
npm run start  # Production server
```

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
