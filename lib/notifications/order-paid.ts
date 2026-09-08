import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email/provider";
import { buildOrderNotificationEmail } from "@/lib/email/order-notification";
import { sendPushNotification, PushSubscriptionGoneError } from "@/lib/push/provider";
import { formatPence } from "@/lib/money";
import type { Order, OrderItem } from "@prisma/client";

const EVENT_ORDER_PAID = "ORDER_PAID";

/**
 * Claims the right to attempt one (order, channel, recipient) notification.
 * Returns null if it was already SENT (caller must skip — this is the
 * idempotency guard against retried Stripe webhooks). Returns the claimed
 * row otherwise, including re-claiming a previous FAILED attempt so a retry
 * has somewhere to write its result. Safe under concurrent callers: SQLite
 * serializes the transaction, so two simultaneous claims for the same key
 * can never both proceed to send.
 */
async function claimNotification(params: {
  orderId: string;
  channel: "EMAIL" | "PUSH";
  recipient: string;
  pushSubscriptionId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.orderNotification.findUnique({
      where: {
        orderId_channel_event_recipient: {
          orderId: params.orderId,
          channel: params.channel,
          event: EVENT_ORDER_PAID,
          recipient: params.recipient,
        },
      },
    });

    if (existing?.status === "SENT") return null;

    if (existing) {
      return tx.orderNotification.update({
        where: { id: existing.id },
        data: { status: "PENDING", attemptedAt: new Date(), errorMessage: null },
      });
    }

    return tx.orderNotification.create({
      data: {
        orderId: params.orderId,
        channel: params.channel,
        event: EVENT_ORDER_PAID,
        recipient: params.recipient,
        pushSubscriptionId: params.pushSubscriptionId ?? null,
        status: "PENDING",
      },
    });
  });
}

function sanitizeErrorMessage(err: unknown): string {
  // Provider errors can embed response bodies — keep it short and never let
  // it be the vehicle for leaking a key that a bug elsewhere put in a message.
  const message = err instanceof Error ? err.message : String(err);
  return message.replace(/[A-Za-z0-9_-]{20,}/g, "[redacted]").slice(0, 500);
}

async function sendAdminOrderEmail(order: Order & { items: OrderItem[] }, recipient: string) {
  const claim = await claimNotification({ orderId: order.id, channel: "EMAIL", recipient });
  if (!claim) return; // already sent — duplicate webhook, no resend

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { subject, text } = buildOrderNotificationEmail(order, siteUrl);
    const result = await sendEmail({ to: recipient, subject, text });
    await prisma.orderNotification.update({
      where: { id: claim.id },
      data: { status: "SENT", sentAt: new Date(), providerMessageId: result.providerMessageId },
    });
  } catch (err) {
    await prisma.orderNotification.update({
      where: { id: claim.id },
      data: { status: "FAILED", errorMessage: sanitizeErrorMessage(err) },
    }).catch(() => {});
  }
}

async function sendAdminOrderPush(
  order: Order & { items: OrderItem[] },
  subscription: { id: string; endpoint: string; p256dh: string; auth: string }
) {
  const claim = await claimNotification({
    orderId: order.id,
    channel: "PUSH",
    recipient: subscription.id,
    pushSubscriptionId: subscription.id,
  });
  if (!claim) return;

  try {
    const payload = {
      title: "New Support Your Local Patriot Order 🎉",
      body: `${order.orderNumber} — ${formatPence(order.total)} — ${order.items.reduce((n, i) => n + i.quantity, 0)} items`,
      url: `/admin/orders/${order.id}`,
    };
    await sendPushNotification(subscription, payload);
    await prisma.orderNotification.update({
      where: { id: claim.id },
      data: { status: "SENT", sentAt: new Date() },
    });
    await prisma.adminPushSubscription.update({
      where: { id: subscription.id },
      data: { lastSuccessfulNotificationAt: new Date() },
    });
  } catch (err) {
    await prisma.orderNotification.update({
      where: { id: claim.id },
      data: { status: "FAILED", errorMessage: sanitizeErrorMessage(err) },
    }).catch(() => {});

    if (err instanceof PushSubscriptionGoneError) {
      // Permanently dead endpoint — stop trying it on future orders. This
      // never touches the Order itself, only the (now-useless) subscription.
      await prisma.adminPushSubscription.update({ where: { id: subscription.id }, data: { active: false } }).catch(() => {});
    }
  }
}

/**
 * Fires admin EMAIL + PUSH notifications for a just-paid order. Called from
 * markOrderPaid AFTER its own transaction has already committed the PAID
 * status and stock decrement — nothing in here can undo that, and nothing
 * in here is allowed to throw back out to the webhook handler. Email and
 * push are independent: one failing never blocks the other being attempted.
 */
export async function notifyAdminOfPaidOrder(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.paymentStatus !== "PAID") return;

    const settings = await getSiteSettings();
    if (settings.orderNotificationEmailEnabled && settings.orderNotificationEmail) {
      await sendAdminOrderEmail(order, settings.orderNotificationEmail);
    }

    const subscriptions = await prisma.adminPushSubscription.findMany({ where: { active: true } });
    for (const subscription of subscriptions) {
      await sendAdminOrderPush(order, subscription);
    }
  } catch (err) {
    console.error("Admin order-notification orchestration failed:", (err as Error).message);
  }
}
