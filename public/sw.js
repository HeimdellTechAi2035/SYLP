// Minimal service worker for admin Web Push order notifications. Not a
// general offline/caching PWA worker — intentionally does not intercept
// fetch() at all, so it can't accidentally change how the storefront loads.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const title = payload.title || "HandMade by Mia";
  const options = {
    body: payload.body || "",
    data: { url: payload.url || "/admin/orders" },
    icon: "/brand/logo.jpg",
    badge: "/brand/logo.jpg",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/orders";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientsList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Opens /admin/orders/{id} — that route requires an admin session
      // regardless of how it was reached; the notification URL carries no
      // auth bypass of its own.
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })()
  );
});
