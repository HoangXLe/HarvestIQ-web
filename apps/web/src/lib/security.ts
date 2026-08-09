/**
 * Security helpers: safe JSON, URL allowlists, payload limits.
 */

const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

/** JSON.parse that drops prototype-polluting keys. */
export function safeJsonParse<T>(raw: string): T {
  return JSON.parse(raw, (key, value) => {
    if (DANGEROUS_KEYS.has(key)) return undefined;
    return value;
  }) as T;
}

/** Allow only JPEG/PNG/WebP data URLs for leaf photos. */
export function isSafeImageDataUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 22) return false;
  // Cap ~2.5MB of base64-ish payload in storage/display
  if (value.length > 3_500_000) return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(
    value,
  );
}

/** Hosts allowed for Google Maps embeds/links we generate. */
const MAPS_HOSTS = new Set(["www.google.com", "maps.google.com"]);

/**
 * Path allowlist for Maps URLs we build:
 * - `/maps` (embed: `?q=…&output=embed`)
 * - `/maps/search/<query>` (open-in-Maps link)
 */
const MAPS_PATH_RE = /^\/maps(?:\/search\/[^?#]+)?$/;

/** Only Google Maps embed/search URLs we build ourselves. */
export function isAllowedMapsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    if (!MAPS_HOSTS.has(u.hostname.toLowerCase())) return false;
    if (u.username || u.password) return false;
    if (u.port !== "" && u.port !== "443") return false;
    if (!MAPS_PATH_RE.test(u.pathname)) return false;

    // Embed: https://www.google.com/maps?q=…&output=embed
    if (u.pathname === "/maps") {
      return (
        u.searchParams.has("q") && u.searchParams.get("output") === "embed"
      );
    }

    // Open link: https://www.google.com/maps/search/<query>
    return u.pathname.startsWith("/maps/search/");
  } catch {
    return false;
  }
}

export function sanitizePlainText(
  value: unknown,
  maxLen = 500,
): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLen);
}

export function sanitizeCropType(value: unknown): string | undefined {
  const s = sanitizePlainText(value, 60);
  return s || undefined;
}

/** Max JSON body size we accept on diagnose/forecast APIs (bytes of UTF-8 text). */
export const MAX_API_BODY_BYTES = 32_768; // 32 KB — no image blobs on the wire for demo API
