"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "not-configured" | "enabled" | "disabled" | "error";

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (!vapidPublicKey) {
        setStatus("not-configured");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const existing = await reg.pushManager.getSubscription();
        setStatus(existing ? "enabled" : "disabled");
      } catch {
        setStatus("error");
      }
    }
    check();
  }, [vapidPublicKey]);

  async function enable() {
    if (!vapidPublicKey) return;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notification permission was not granted.");
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });
      const json = subscription.toJSON();
      const res = await fetch("/api/admin/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, label: navigator.userAgent.slice(0, 60) }),
      });
      if (!res.ok) throw new Error("Server rejected the subscription.");
      setStatus("enabled");
    } catch {
      setError("Couldn't enable notifications on this device.");
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/admin/push-subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("disabled");
    } catch {
      setError("Couldn't disable notifications on this device.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") return <p className="text-sm text-ink-soft">Checking this device…</p>;
  if (status === "unsupported") return <p className="text-sm text-ink-soft">This browser doesn&apos;t support push notifications.</p>;
  if (status === "not-configured") return <p className="text-sm text-ink-soft">Push notifications aren&apos;t configured on this server yet.</p>;

  return (
    <div className="space-y-2">
      {status === "enabled" ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-sage font-medium">This device: Enabled ✓</span>
          <button
            type="button"
            onClick={disable}
            disabled={busy}
            className="text-xs underline text-ink-soft hover:text-rose-dark disabled:opacity-60"
          >
            Disable
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="px-4 py-2 rounded-full bg-rose-dark text-ink text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Enabling…" : "Enable order notifications on this device"}
        </button>
      )}
      {error && <p className="text-xs text-rose-dark">{error}</p>}
    </div>
  );
}
