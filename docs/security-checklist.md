# HarvestIQ Security Checklist

**Application:** `apps/web` (farmer MVP)  
**Date:** July 19, 2026  
**Status:** All listed items are **in place** for the local demo build  

Legend: ✓ Implemented · ◐ Accepted risk for MVP (documented) · ✗ Not applicable

---

## 1. Security measures in place

| Status | Measure | Where |
|--------|---------|--------|
| ✓ | No API keys or secrets committed to the repo | Repo scan / `.gitignore` |
| ✓ | No `NEXT_PUBLIC_*` secrets exposed to the browser | Client bundle |
| ✓ | `.env*` ignored; `.env.example` documents server-only future keys | `apps/web/.env.example` |
| ✓ | Browser → Anthropic (or other AI) calls disabled | Prototype + Next app |
| ✓ | Diagnose API rejects image/`base64` payloads | `api/diagnose/route.ts` |
| ✓ | API request body size capped (~32 KB) | `MAX_API_BODY_BYTES` |
| ✓ | HTTP security headers (CSP, frame options, nosniff, referrer, permissions) | `next.config.ts` |
| ✓ | `X-Powered-By` disabled | `poweredByHeader: false` |
| ✓ | Google Maps URLs allowlisted (HTTPS only) | `isAllowedMapsUrl` |
| ✓ | Maps iframe sandboxed | Resources page |
| ✓ | Safe image data-URL allowlist (jpeg/png/webp only) | `isSafeImageDataUrl` |
| ✓ | Prototype-pollution resistant JSON parse | `safeJsonParse` |
| ✓ | Stronger client IDs via `crypto.randomUUID()` | `storage.ts` / `uid()` |
| ✓ | React default XSS escaping (no `dangerouslySetInnerHTML`) | App components |
| ✓ | SQL injection surface absent (no SQL / ORM) | Architecture |
| ◐ | Demo APIs unauthenticated (local MVP only) | Documented in security audit |
| ◐ | localStorage unencrypted (local prototype only) | Documented in security audit |

---

## 2. Data protection methods

| Status | Method | Details |
|--------|--------|---------|
| ✓ | Scoped storage keys | `harvestiq:` prefix for profile, farms, diagnoses, units |
| ✓ | Storage availability probe | Fails gracefully if private mode blocks storage |
| ✓ | Max read/write size (~8 MB) | Prevents oversized / poisoned localStorage |
| ✓ | Corrupt data recovery | Boot continues with safe defaults + load error banner |
| ✓ | Filter invalid diagnoses on load | Requires id + diagnosis + safe image URL |
| ✓ | Sanitize text before persist | Disease name, description, tips, farmId length-capped |
| ✓ | Reject unsafe images on save | Save fails with clear message if URL not a safe data image |
| ✓ | Photos stay in the browser for demo inference | Not uploaded to diagnose API |
| ✓ | Clear-data confirmation | Settings requires explicit confirm before wipe |
| ✓ | Persist status visible to user | “Saved locally” / “Saving…” / “Not saved” badge |
| ✓ | Quota / write failures surfaced | Toast + persist badge on storage errors |
| ◐ | No encryption at rest in browser | Acceptable for local demo; use backend + S3 in production |
| ◐ | No multi-user isolation | Single-browser workspace |

---

## 3. Input validation rules

### 3.1 Client forms (`lib/validation.ts`)

| Status | Form | Rules |
|--------|------|--------|
| ✓ | **Add / Edit farm** | Name required, 2–80 chars; crop required; acres optional number 0–1,000,000; location max 120 chars |
| ✓ | **Profile (Settings)** | Name required, 2–60 chars; farm/cooperative required, max 80 chars |
| ✓ | **Field conditions (Diagnose)** | Temp required (metric −20–50 °C / imperial −4–122 °F); humidity 0–100; rainfall ≥0 (capped); leaf wetness 0–24 hrs; trend required |
| ✓ | **Resources location** | Required, 2–120 chars before map search |
| ✓ | **Upload file** | Must be `image/*`; max ~12 MB client-side |
| ✓ | **Farm select before diagnose** | Farm required; error if missing |

### 3.2 Server / security sanitizers (`lib/security.ts` + API routes)

| Status | Rule | Limit / behavior |
|--------|------|------------------|
| ✓ | Strip control characters from text | `sanitizePlainText` |
| ✓ | Crop type length | Max 60 chars |
| ✓ | Forecast crop / disease / trend sanitized | Length-capped strings |
| ✓ | Image data URL pattern | `data:image/(jpeg\|jpg\|png\|webp);base64,…` only |
| ✓ | Image data URL size | Max ~3.5M characters |
| ✓ | Drop `__proto__` / `constructor` / `prototype` on JSON parse | `safeJsonParse` |
| ✓ | Invalid JSON body → 400 | Diagnose & forecast APIs |
| ✓ | Oversized body → 413 | Diagnose & forecast APIs |
| ✓ | Maps host allowlist | `www.google.com` / `maps.google.com` over HTTPS |

### 3.3 UI validation feedback

| Status | Behavior |
|--------|----------|
| ✓ | Inline field errors (`FieldError`, `role="alert"`) |
| ✓ | `aria-invalid` on failing inputs |
| ✓ | Toast when submit blocked by validation |
| ✓ | Errors clear as the user corrects fields |

---

## 4. Error handling coverage

| Status | Coverage | Behavior |
|--------|----------|----------|
| ✓ | Workspace load failure | Error banner + **Try again** + usable empty defaults |
| ✓ | Storage save / delete failure | Toast + “Not saved” badge; action does not crash UI |
| ✓ | Diagnose API failure | On-page error banner + toast; **Try again** / **Dismiss** |
| ✓ | Forecast API failure | Same pattern as diagnose |
| ✓ | Network / fetch failures | Friendly “Could not reach the server…” message |
| ✓ | Invalid upload / resize failure | Toast; user can pick another photo |
| ✓ | Report save failure | Toast; stays on diagnose page |
| ✓ | Farm / profile / units / clear-data failures | try/catch + toast |
| ✓ | Report delete failure | try/catch; persist toast if storage fails |
| ✓ | Resources category errors | try/catch + toast |
| ✓ | Unhandled promise rejections | Global listener → toast |
| ✓ | Window `error` events | Global listener → toast (filters ResizeObserver noise) |
| ✓ | React render crashes | `ErrorBoundary` with recovery + dashboard escape |
| ✓ | Route-level failures | `app/error.tsx` Try again / Dashboard |
| ✓ | Root app failures | `app/global-error.tsx` Reload |
| ✓ | API internal exceptions | JSON `{ error }` + safe message (no stack to client) |
| ✓ | Loading states on async actions | Spinners / “Saving…” / “Analyzing…” / disabled buttons |

---

## 5. Quick sign-off

| Area | Checklist complete? |
|------|---------------------|
| Security measures | ✓ |
| Data protection methods | ✓ |
| Input validation rules | ✓ |
| Error handling coverage | ✓ |

**Overall:** HarvestIQ local MVP meets the security checklist above for course/demo use. Production deployment still requires authentication, rate limiting, encrypted server-side storage, and tightened CSP (see `docs/security-audit.md`).

---

*Related docs:* [security-audit.md](./security-audit.md) · [testing-report.md](./testing-report.md) · [testing-checklist.md](./testing-checklist.md)
