# Security Audit Report - ClinicScribe Website

**Date:** 2026-03-28
**Scope:** Full codebase review of `/src` — API routes, Genie FHIR client, frontend, dependencies, Next.js config

---

## Summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| CRITICAL | 1     | 1     | 0         |
| HIGH     | 4     | 4     | 0         |
| MEDIUM   | 3     | 2     | 1         |
| LOW      | 2     | 1     | 1         |

---

## CRITICAL

### 1. Unauthenticated API Routes (FIXED)
**Routes:** All `/api/genie/*` endpoints
**Risk:** Anyone who discovered the API URLs could search patients by name/email/phone, retrieve full patient records, read clinical summaries (conditions, allergies, observations), and **push clinical notes** back to Genie — all without any authentication.
**Fix:** Added `src/middleware.ts` that gates all `/api/genie/*` routes behind an `x-api-key` header validated against the `GENIE_API_KEY` environment variable. Unauthenticated requests receive a 401. Missing config returns 503.

---

## HIGH

### 2. Status Endpoint Leaked Internal Config (FIXED)
**Route:** `GET /api/genie/status`
**Risk:** Exposed `fhirBaseUrl`, `practiceId`, and names of missing env vars to unauthenticated callers — giving attackers a map of the backend infrastructure.
**Fix:** Status endpoint now returns only `{ integration, configured: boolean }`. No URLs, IDs, or env var names are exposed.

### 3. Error Messages Leaked Internal Details (FIXED)
**Routes:** All `/api/genie/*` routes
**Risk:** Error responses included `detail: error.message` which could expose FHIR server URLs, token endpoint details, OAuth error descriptions, and internal stack information.
**Fix:** Created `src/lib/genie/error-handler.ts` — a shared error handler that logs full details server-side but returns only generic messages to clients (e.g., "Genie authentication failed", "Internal server error").

### 4. No Input Validation on Patient IDs — Path Traversal Risk (FIXED)
**Routes:** `GET /api/genie/patients/[id]`, `GET /api/genie/patients/[id]/summary`
**Risk:** The `id` path parameter was passed directly to the FHIR client which constructs URLs like `/Patient/${id}`. Malformed IDs (containing `/`, `..`, or special characters) could manipulate the FHIR request path.
**Fix:** Added `isValidFhirId()` validation — IDs must match `^[A-Za-z0-9\-.]{1,64}$` (standard FHIR resource ID format). Invalid IDs return 400.

### 5. Clinical Notes Endpoint Vulnerable to Stored XSS (FIXED)
**Route:** `POST /api/genie/clinical-notes`
**Risk:** Accepted `contentType: "text/html"` and passed unsanitized `content` and `title` directly to Genie. Malicious HTML/JS could be stored in the EHR system and executed when viewed by practitioners.
**Fix:** HTML is now stripped from both `content` and `title` via `stripHtml()`. Content type is forced to `text/plain`. Added 100 KB content size limit (413 response if exceeded). Added FHIR ID validation for `patientId` and `practitionerId`.

---

## MEDIUM

### 6. No Security Headers (FIXED)
**File:** `next.config.ts`
**Risk:** No HTTP security headers were configured, leaving the site vulnerable to clickjacking, MIME sniffing, and missing HSTS.
**Fix:** Added comprehensive security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation, interest-cohort disabled)
- `Strict-Transport-Security` (2 years, includeSubDomains, preload)
- `Content-Security-Policy` (default-src self, restricted script/style/font/img sources, frame-ancestors none)

### 7. Unbounded `_count` Query Parameter (FIXED)
**Routes:** patients, appointments, practitioners
**Risk:** `_count` was parsed via `Number()` with no upper bound. Passing `_count=999999` could cause performance degradation or denial of service on the FHIR server.
**Fix:** Added `parseCount()` utility that clamps values to a maximum of 100 and defaults invalid/missing values.

### 8. No Rate Limiting (NOT FIXED — Requires Infrastructure)
**Routes:** All `/api/genie/*` endpoints
**Risk:** Even with API key auth, there's no rate limiting. A compromised or misconfigured client could hammer the FHIR server.
**Recommendation:** Deploy behind a reverse proxy (e.g., Vercel's built-in rate limiting, Cloudflare, or AWS WAF) or add an in-memory rate limiter like `next-rate-limit` or `upstash/ratelimit` for serverless environments.

---

## LOW

### 9. Dependency Vulnerabilities (PARTIALLY FIXED)
**Package:** `picomatch` (ReDoS) — fixed by `npm audit fix`
**Remaining:** `brace-expansion < 5.0.5` (moderate ReDoS) in the eslint dependency chain. Cannot be fixed without a breaking eslint upgrade. This is a **dev dependency only** and does not affect production runtime.

### 10. Google Fonts Loaded from External CDN
**File:** `src/app/globals.css`
**Risk:** Imports from `fonts.googleapis.com` create an external dependency and potential privacy concern for a healthcare application (Google can log visitor IPs). Strict CSP deployments may also block this.
**Recommendation:** Self-host the fonts using `next/font/google` (automatic with Next.js) or download the font files into `/public/fonts/`.

---

## Files Changed

| File | Action |
|------|--------|
| `next.config.ts` | Added security headers + CSP |
| `src/middleware.ts` | **NEW** — API key authentication for `/api/genie/*` |
| `src/lib/genie/error-handler.ts` | **NEW** — Shared sanitized error handler |
| `src/lib/genie/validation.ts` | **NEW** — Input validation (FHIR IDs, _count, content size, HTML strip) |
| `src/lib/genie/index.ts` | Updated barrel exports |
| `src/app/api/genie/patients/route.ts` | Removed inline error handler, use shared handler + parseCount |
| `src/app/api/genie/patients/[id]/route.ts` | Added FHIR ID validation, shared error handler |
| `src/app/api/genie/patients/[id]/summary/route.ts` | Added FHIR ID validation, shared error handler |
| `src/app/api/genie/appointments/route.ts` | Removed inline error handler, use shared handler + parseCount |
| `src/app/api/genie/practitioners/route.ts` | Removed inline error handler, use shared handler + parseCount |
| `src/app/api/genie/clinical-notes/route.ts` | Added XSS sanitization, content size limit, ID validation |
| `src/app/api/genie/status/route.ts` | Removed config/env var leakage |
| `.env.example` | Added `GENIE_API_KEY` with generation instructions |

---

## Setup Required After This Audit

1. **Generate an API key** and add it to your `.env.local`:
   ```bash
   echo "GENIE_API_KEY=$(openssl rand -hex 32)" >> .env.local
   ```

2. **Update all API clients** to include the `x-api-key` header in requests to `/api/genie/*`.

3. **Consider rate limiting** at the infrastructure level (Vercel, Cloudflare, etc.).

4. **Consider self-hosting Google Fonts** to eliminate the external dependency.
