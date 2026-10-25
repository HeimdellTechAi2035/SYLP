"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { getConsentSnapshot, getConsentServerSnapshot, subscribeToConsent } from "@/lib/consent";
import { trackablePath } from "@/lib/analytics/traffic-policy";

export default function VisitorTracker() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, getConsentServerSnapshot);
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!consent?.analytics) {
      last.current = null;
      try { sessionStorage.removeItem("sylp-traffic-visit"); } catch {}
      return;
    }
    if (!trackablePath(pathname)) { last.current = null; return; }
    if (last.current === pathname) return;
    let visitId: string;
    try {
      const stored = JSON.parse(sessionStorage.getItem("sylp-traffic-visit") || "null");
      visitId = stored && Date.now() - stored.time < 30 * 60_000 ? stored.id : crypto.randomUUID();
      sessionStorage.setItem("sylp-traffic-visit", JSON.stringify({ id: visitId, time: Date.now() }));
    } catch { visitId = crypto.randomUUID(); }
    last.current = pathname;
    void fetch("/api/traffic", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId, eventId: crypto.randomUUID(), path: pathname, consent: true }), keepalive: true,
    }).catch(() => { /* Statistics must never interrupt browsing. */ });
  }, [pathname, consent?.analytics]);
  return null;
}
