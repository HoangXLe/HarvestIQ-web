import { safeJsonParse } from "./security";

const PREFIX = "harvestiq:";

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

export function storageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = PREFIX + "__probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export async function storageGet<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    // Reject absurdly large blobs (e.g. poisoned localStorage)
    if (raw.length > 8_000_000) {
      throw new StorageError(
        "Saved data is too large or corrupted. Clear local data in Settings.",
      );
    }
    return safeJsonParse<T>(raw);
  } catch (e) {
    if (e instanceof StorageError) throw e;
    throw new StorageError(
      "Could not read saved data. It may be corrupted — try clearing local data in Settings.",
    );
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > 8_000_000) {
      throw new StorageError(
        "This save is too large for browser storage. Delete older reports and try again.",
      );
    }
    localStorage.setItem(PREFIX + key, serialized);
  } catch (e) {
    if (e instanceof StorageError) throw e;
    const quota =
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" || e.code === 22);
    throw new StorageError(
      quota
        ? "Storage is full. Delete some reports or clear data in Settings, then try again."
        : "Could not save data to this browser. Check private browsing settings.",
    );
  }
}

export async function storageDelete(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    throw new StorageError("Could not remove saved data from this browser.");
  }
}

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
