/** User-facing error helpers — keep messages actionable, never crash the UI. */

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof Error && error.message.trim()) {
    const msg = error.message.trim();
    // Network / fetch failures
    if (
      msg === "Failed to fetch" ||
      msg.includes("NetworkError") ||
      msg.includes("Load failed")
    ) {
      return "Could not reach the server. Check your connection and try again.";
    }
    if (msg.includes("AbortError")) {
      return "The request was cancelled. Please try again.";
    }
    return msg;
  }
  if (typeof error === "string" && error.trim()) return error.trim();
  return fallback;
}

/**
 * Run an async user action. Always resolves.
 * On failure, calls onError (or console) and returns { ok: false }.
 */
export async function runSafe<T>(
  action: () => Promise<T>,
  onError?: (message: string) => void,
  fallbackMessage?: string,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const data = await action();
    return { ok: true, data };
  } catch (error) {
    const message = getErrorMessage(error, fallbackMessage);
    try {
      onError?.(message);
    } catch {
      console.error(message);
    }
    return { ok: false, message };
  }
}

/** Sync wrapper for click handlers that may throw. */
export function guardAction(
  action: () => void,
  onError?: (message: string) => void,
): void {
  try {
    action();
  } catch (error) {
    const message = getErrorMessage(error);
    try {
      onError?.(message);
    } catch {
      console.error(message);
    }
  }
}
