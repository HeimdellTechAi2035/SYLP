"use client";

import { useEffect } from "react";

/** Renders nothing — just keeps the admin service worker registered/updated
 *  on every admin page load, so a notification click has a live worker to
 *  handle it regardless of which page the admin was last on. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
