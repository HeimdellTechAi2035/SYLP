"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getConsentSnapshot,
  storeConsent,
  subscribeToConsent,
  getConsentServerSnapshot,
} from "@/lib/consent";

export default function CookieConsent() {
  const consent = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, getConsentServerSnapshot);

  if (consent !== null) return null;

  function acceptAll() {
    storeConsent({ necessary: true, analytics: true, marketing: true });
  }

  function necessaryOnly() {
    storeConsent({ necessary: true, analytics: false, marketing: false });
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink text-cream p-4 sm:p-5">
      <div className="container-page flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-cream/80 flex-1">
          We use necessary cookies to run this site, and optional analytics/marketing cookies to understand traffic —
          only with your consent. See our{" "}
          <Link href="/legal/cookies" className="underline text-cream">Cookie Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={necessaryOnly} className="px-4 py-2 rounded-full border border-cream/30 text-sm font-medium">
            Necessary Only
          </button>
          <button onClick={acceptAll} className="px-4 py-2 rounded-full bg-rose text-ink text-sm font-semibold">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
