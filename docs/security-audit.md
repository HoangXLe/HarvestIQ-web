# Security audit — HarvestIQ (July 2026)

Scope: `apps/web` (Next.js farmer app) and `prototypes/field-diagnostics.html`.

## Summary

| Area | Status |
|------|--------|
| Exposed API keys / secrets | **None found** in repo; prototype Anthropic client call **removed** |
| SQL injection | **N/A** — no SQL / ORM in MVP |
| XSS | Mitigated (React escaping + safe image URLs + maps allowlist) |
| Insecure data handling | Hardened (localStorage limits, sanitization, no image upload to API) |

## Findings & fixes

### Critical / High (fixed)

1. **Browser → third-party AI API path (prototype)**  
   - Risk: Calling Anthropic from the browser invites leaked keys / CORS abuse.  
   - Fix: Prototype now uses local demo models only; external `fetch` to Anthropic removed.

2. **Large base64 images POSTed to `/api/diagnose`**  
   - Risk: DoS via multi‑MB bodies; unnecessary data exposure.  
   - Fix: Client no longer sends `imageBase64`; API rejects image payloads and caps body size (~32 KB).

### Medium (fixed)

3. **Unvalidated `imageDataUrl` from localStorage**  
   - Risk: Poisoned storage could inject non-image URLs into `<img>`.  
   - Fix: `isSafeImageDataUrl()` + `SafeLeafImage`; unsafe records dropped on load; save rejects bad URLs.

4. **Missing security headers**  
   - Fix: CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` in `next.config.ts`.

5. **Maps iframe**  
   - Fix: HTTPS Google Maps allowlist + `sandbox` attribute.

6. **JSON.prototype pollution via localStorage**  
   - Fix: `safeJsonParse` strips `__proto__` / `constructor` / `prototype` keys.

### Low / accepted for MVP

7. **localStorage stores farm data & leaf photos unencrypted**  
   - Accepted for local prototype. Anyone with OS access to the browser profile can read it.  
   - Production: authenticated backend + encrypted object storage (S3), no long-lived photos in `localStorage`.

8. **Open diagnose/forecast APIs (no auth)**  
   - Accepted for local demo. Demo endpoints are cheap and body-limited.  
   - Production: auth, rate limits, server-side inference only.

9. **CSP allows `'unsafe-inline'` / `'unsafe-eval'` for Next.js**  
   - Needed for Next/Turbopack DX. Tighten for production builds if possible.

## SQL injection

No database or query builder is used. There is **no SQL injection surface** in the current MVP.

## Secrets checklist

- [x] No `.env` files with secrets in the repo  
- [x] No `NEXT_PUBLIC_*` API keys  
- [x] `.gitignore` excludes `.env*`  
- [x] `.env.example` documents server-only future keys  

## Retest after fixes

1. `npm run build` succeeds  
2. Diagnose still works (crop-only demo API)  
3. Saved reports still show leaf images  
4. Resources map still embeds Google Maps  
5. Confirm Network tab: diagnose POST body has **no** `imageBase64`
