"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { notifyAdminOfPaidOrder } from "@/lib/notifications/order-paid";

export async function updateOrderNotificationSettings(formData: FormData) {
  await requireAdminSession();

  const enabled = formData.get("orderNotificationEmailEnabled") === "on";
  const email = String(formData.get("orderNotificationEmail") || "").trim() || null;

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { orderNotificationEmailEnabled: enabled, orderNotificationEmail: email },
    create: { id: 1, orderNotificationEmailEnabled: enabled, orderNotificationEmail: email },
  });

  revalidatePath("/admin/settings");
}

export async function setPushSubscriptionActive(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("subscriptionId") || "");
  const active = formData.get("active") === "true";
  if (!id) return;

  await prisma.adminPushSubscription.update({ where: { id }, data: { active } }).catch(() => {});
  revalidatePath("/admin/settings");
}

/**
 * Re-attempts EMAIL + PUSH delivery for one order. Safe to click repeatedly —
 * relies on the exact same idempotency as the webhook path (skips anything
 * already SENT, only re-tries what's missing or FAILED).
 */
export async function retryOrderNotifications(orderId: string) {
  await requireAdminSession();
  await notifyAdminOfPaidOrder(orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}
