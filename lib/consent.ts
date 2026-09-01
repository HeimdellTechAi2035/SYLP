export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "hbm_cookie_consent";
export const CONSENT_UPDATED_EVENT = "hbm-consent-updated";

// Cached so getConsentSnapshot (used by useSyncExternalStore) returns a stable
// reference when the underlying raw value hasn't changed — otherwise a fresh
// object on every call trips React's "getSnapshot should be cached" warning.
let cachedRaw: string | null = null;
let cachedValue: ConsentPreferences | null = null;

export function getConsentSnapshot(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedValue = raw ? JSON.parse(raw) : null;
    } catch {
      cachedValue = null;
    }
  }
  return cachedValue;
}

export function storeConsent(prefs: ConsentPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));
  } catch {
    // localStorage unavailable (private browsing, etc.) — consent banner will just reappear next visit
  }
}

/** For useSyncExternalStore — treats localStorage + a same-tab custom event as the external store. */
export function subscribeToConsent(callback: () => void): () => void {
  window.addEventListener(CONSENT_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getConsentServerSnapshot(): ConsentPreferences | null {
  return null;
}
