import webpush from "web-push";

export type PushSubscriptionKeys = { endpoint: string; p256dh: string; auth: string };

/** Thrown for a subscription that will never work again (browser reports it gone). */
export class PushSubscriptionGoneError extends Error {}

export function pushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let vapidConfigured = false;
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:orders@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidConfigured = true;
}

/**
 * Sends one Web Push message. Throws (never fabricates success) when VAPID
 * isn't configured or the push service rejects delivery. A 404/410 response
 * means the subscription is permanently dead — callers should deactivate it.
 */
export async function sendPushNotification(subscription: PushSubscriptionKeys, payload: object): Promise<void> {
  if (!pushConfigured()) {
    throw new Error("Push not configured — set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.");
  }
  ensureVapidConfigured();

  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload)
    );
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      throw new PushSubscriptionGoneError("Push subscription no longer valid");
    }
    throw err;
  }
}
