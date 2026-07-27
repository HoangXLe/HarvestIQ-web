# HarvestIQ Testing Report

**Product:** HarvestIQ — Field Diagnostics (farmer web app)  
**Course:** AIML-510 — Responsible Applications of AI  
**Application path:** `apps/web`  
**Report date:** July 19, 2026  
**Build status:** Production build passing (`npm run build`)  
**Test environment:** Local Next.js 15 (Turbopack), http://localhost:3000  

---

## 1. Executive summary

HarvestIQ was implemented as a Next.js farmer MVP covering dashboard analytics, farm management, crop photo diagnosis, 7-day risk forecasting, reports, nearby resources, and settings. Testing and hardening covered functional flows, form validation, persistence, mobile layout, crash/error handling, security, and accessibility.

| Category | Outcome |
|----------|---------|
| Features tested | 9 major areas, 40+ interactive controls |
| Bugs found & fixed | 12 issues (build, UX, runtime, security) |
| Security measures | 10 mitigations implemented |
| Accessibility | Keyboard, screen-reader, motion, and contrast supports added |

Manual walkthrough checklist: [`testing-checklist.md`](./testing-checklist.md)  
Security detail: [`security-audit.md`](./security-audit.md)

---

## 2. Complete list of features tested

### 2.1 Application shell

| Feature | How tested | Result |
|---------|------------|--------|
| App boot / workspace hydration | Load `/` | Pass — loading state then dashboard |
| Persist badge (Saved locally / Saving / Not saved) | Save farm / profile | Pass |
| Desktop navigation (6 links) | Click each route | Pass |
| Mobile Menu / Close | Narrow viewport | Pass |
| Mobile bottom quick nav | Home, Farms, Scan, Reports, Help, Settings | Pass |
| Active nav highlight | Route changes | Pass |
| Profile chip (name + farm) | Settings save | Pass |
| Toast notifications | Success and error actions | Pass |

### 2.2 Dashboard (`/`)

| Feature | How tested | Result |
|---------|------------|--------|
| Greeting with grower first name | Default Maria Lopez profile | Pass |
| **New diagnosis** CTA | Navigates to `/diagnose` | Pass |
| Stats: farms, diagnoses, confidence, high-risk alerts | Empty + after saved report | Pass |
| Recent activity list | After diagnosis save | Pass |
| Highest current risk leaderboard | After forecast save | Pass |
| Risk by crop type bars | After forecast save | Pass |
| Confidence trend chart | ≥2 diagnoses | Pass |
| Empty-state copy for all panels | Fresh workspace | Pass |

### 2.3 My Farms (`/farms`)

| Feature | How tested | Result |
|---------|------------|--------|
| Empty state + **Add your first farm** | No farms | Pass |
| **+ Add farm** modal | Open/close | Pass |
| Create farm (name, crop, acres, location) | Save | Pass |
| Edit farm | Prefill + update | Pass |
| Remove farm | Delete + toast | Pass |
| Form validation (required name, acres range, lengths) | Invalid submit | Pass |
| Persistence after refresh | Reload browser | Pass |

### 2.4 Diagnose (`/diagnose`)

| Feature | How tested | Result |
|---------|------------|--------|
| 4-step stepper UI | Upload → classify → forecast | Pass |
| Farm selector | With / without farms | Pass |
| Photo upload (click + drag-drop) | JPG/PNG | Pass |
| Reject non-image / oversized file | Invalid files | Pass |
| **Run diagnosis** + loading state | Demo API | Pass |
| Specimen card (confidence, severity, tips) | After classify | Pass |
| Field conditions form + units (°C/mm vs °F/in) | Settings toggle | Pass |
| Env validation | Bad humidity/wetness | Pass |
| **Forecast outbreak risk** + gauge/bars | Demo API | Pass |
| Error banners (Try again / Dismiss) | Forced failure path | Pass |
| **Save to reports** | Redirect + persist | Pass |
| **Go to My Farms** when no farms | Link | Pass |

### 2.5 Reports (`/reports`)

| Feature | How tested | Result |
|---------|------------|--------|
| Empty state | No diagnoses | Pass |
| Farm filter dropdown | All / single farm | Pass |
| Expand / collapse report row | Click summary | Pass |
| Detail: symptoms, treatment, 7-day risk | Expanded row | Pass |
| **Delete this report** | Remove + toast + refresh | Pass |

### 2.6 Resources (`/resources`)

| Feature | How tested | Result |
|---------|------------|--------|
| Farm + location fields | Auto-fill from farm | Pass |
| Location required before map search | Empty location | Pass |
| Category chips (5 types) | Agronomist → Dealer | Pass |
| Google Maps embed | Valid location | Pass |
| Open in Google Maps link | New tab | Pass |
| High-risk alert + **Find agronomists** | After severe forecast | Pass |

### 2.7 Settings (`/settings`)

| Feature | How tested | Result |
|---------|------------|--------|
| Profile save (name, farm/cooperative) | Validation + persist | Pass |
| Metric units toggle | Diagnose labels update | Pass |
| Clear all local data | Confirm / cancel | Pass |
| Disclaimer text | Visible | Pass |

### 2.8 Cross-cutting

| Feature | How tested | Result |
|---------|------------|--------|
| localStorage persistence | Refresh after writes | Pass |
| Mobile responsive layout (~375px) | Layout / stacking | Pass |
| Demo AI APIs `/api/diagnose`, `/api/forecast` | Network + UI | Pass |
| Production build | `npm run build` | Pass |

### 2.9 Intentionally out of scope (not tested as present)

- Login / registration (deferred per validation report)
- Live OpenWeatherMap feed
- Production YOLO / EfficientNet / XGBoost models
- Multi-user auth / RBAC

---

## 3. Bugs found and fixed

| # | Severity | Area | Bug | Fix |
|---|----------|------|-----|-----|
| 1 | High | Build | TypeScript error: farm crop form typed as literal `"Tomato"` only | Widened form crop type to `string` |
| 2 | High | Dev server | `next dev --turbopack 3000` treated `3000` as a directory | Scripts use `--port 3000` explicitly |
| 3 | Medium | Diagnose | Large base64 images sent to API (DoS / data exposure) | Client sends crop only; API rejects `imageBase64` |
| 4 | Medium | Prototype | Browser could call Anthropic API without a safe secret model | Removed external AI `fetch`; demo-only |
| 5 | Medium | Runtime | Unhandled promise rejections could crash UX silently | Global rejection/error listeners + toasts |
| 6 | Medium | Reports | Delete report had no try/catch | Wrapped in try/catch; store already toasts persist errors |
| 7 | Medium | Storage | Corrupt / polluted localStorage could break boot | Safe JSON parse, size limits, sanitize on load |
| 8 | Low | UX | Auth/login gated demo awkwardly | Opened directly to dashboard (product decision) |
| 9 | Low | Lint | `<a href="/">` in error page failed ESLint | Replaced with Next.js `<Link>` |
| 10 | Low | Images | Empty `alt` on leaf thumbnails | Descriptive alts for dashboard/reports |
| 11 | Low | Navigation | Duplicate `farmer-app` vs `apps/web` caused confusion | Consolidated to `apps/web` monorepo layout |
| 12 | Low | API | Weak/empty API error bodies | Structured JSON errors + body size checks |

**Verification:** Issues above retested via build success and/or targeted UI flows after the fix.

---

## 4. Security measures implemented

| Measure | Implementation |
|---------|----------------|
| No secrets in client | No API keys in repo; `.env.example` documents server-only future keys |
| Block browser AI secrets path | Prototype Anthropic call removed |
| API payload limits | ~32 KB max on diagnose/forecast; images not accepted |
| Safe image rendering | `isSafeImageDataUrl` + `SafeLeafImage` |
| Sanitize saved diagnosis text | Strips control chars / length caps on save |
| Prototype-pollution resistant JSON | `safeJsonParse` drops `__proto__`, `constructor`, `prototype` |
| Maps URL allowlist | HTTPS `google.com` / `maps.google.com` only |
| Iframe sandbox | Resources map iframe sandboxed |
| HTTP security headers | CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| `poweredByHeader: false` | Hides Next.js fingerprint header |
| Stronger IDs | `crypto.randomUUID()` for record IDs when available |

**Not claimed as production-complete:** localStorage remains unencrypted; demo APIs are unauthenticated (documented acceptance for local MVP).

---

## 5. Accessibility features added

| Feature | Where |
|---------|--------|
| Skip to main content link | App shell (keyboard-focusable) |
| Main landmark (`id="main-content"`) | App shell `<main>` |
| Visible focus rings (`:focus-visible`) | Global CSS (husk outline) |
| Reduced motion respect | `prefers-reduced-motion` disables non-essential animation |
| Labeled form fields (`htmlFor` / `id`) | Farms, Diagnose, Resources, Settings |
| Invalid field announcement (`aria-invalid` + `role="alert"`) | Validated forms |
| Field error messages | `FieldError` component |
| Mobile nav toggle semantics | `aria-expanded`, `aria-label="Toggle navigation"` |
| Units toggle state | `aria-pressed` on metric switch |
| Live region for toasts | `role="status"` |
| Error / alert regions | `role="alert"` on banners and error boundary |
| Decorative spinner hidden | `aria-hidden` on loading spinner |
| Meaningful image alternatives | Leaf scan alts on dashboard/reports; fallback `aria-label` when image blocked |
| Touch-friendly controls | ~44px minimum button height on small screens |
| Semantic headings / structure | Page `h1` via `ViewHeader`, section titles |
| Language attribute | `<html lang="en">` |

**Known a11y follow-ups (not blocking MVP):** formal axe/WCAG audit, full keyboard trap testing in farm modal, and color-contrast lab measurement against WCAG AA.

---

## 6. Test evidence & artifacts

| Artifact | Location |
|----------|----------|
| Manual checklist | `docs/testing-checklist.md` |
| Security audit | `docs/security-audit.md` |
| Architecture notes | `docs/architecture.md` |
| MVP feature map | `docs/mvp-features.md` |
| App source | `apps/web/src/` |

---

## 7. Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer / tester | Hoang Le (project author) | July 19, 2026 | MVP accepted for local demo |
| Build gate | `npm run build` | July 19, 2026 | **Pass** |

**Overall verdict:** HarvestIQ farmer MVP is functionally testable end-to-end, hardened against common client/API security issues for a local prototype, and includes baseline accessibility supports suitable for course demonstration. Remaining gaps (auth, encrypted cloud storage, live weather, formal a11y audit) are documented as post-MVP work.
