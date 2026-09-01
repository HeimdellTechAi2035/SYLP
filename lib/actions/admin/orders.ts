"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { stripe, stripeConfigured } from "@/lib/stripe";

export async function updateOrderFulfilment(orderId: string, formData: FormData) {
  const session = await requireAdminSession();
  const fulfilmentStatus = String(formData.get("fulfilmentStatus") || "");
  const trackingCarrier = String(formData.get("trackingCarrier") || "") || null;
  const trackingNumber = String(formData.get("trackingNumber") || "") || null;
  const trackingUrl = String(formData.get("trackingUrl") || "") || null;
  const internalNotes = String(formData.get("internalNotes") || "") || null;

  await prisma.order.update({
    where: { id: orderId },
    data: { fulfilmentStatus, trackingCarrier, trackingNumber, trackingUrl, internalNotes },
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "order.status_change",
      entityType: "Order",
      entityId: orderId,
      detail: `Fulfilment status set to ${fulfilmentStatus}`,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/production");
}

/** Used by the Production queue, where only the status itself changes — never touches tracking/notes fields. */
export async function advanceOrderStatus(orderId: string, status: string) {
  const session = await requireAdminSession();
  await prisma.order.update({ where: { id: orderId }, data: { fulfilmentStatus: status } });
  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "order.status_change",
      entityType: "Order",
      entityId: orderId,
      detail: `Fulfilment status set to ${status}`,
    },
  });
  revalidatePath("/admin/production");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function refundOrder(orderId: string, formData: FormData) {
  const session = await requireAdminSession();
  const full = formData.get("refundType") === "full";

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.stripePaymentIntentId && !order?.stripeCheckoutSessionId) return;

  if (stripeConfigured()) {
    let paymentIntentId = order.stripePaymentIntentId;
    if (!paymentIntentId && order.stripeCheckoutSessionId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
      paymentIntentId = typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : null;
    }
    if (paymentIntentId) {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: full ? undefined : Math.round(Number(formData.get("amount") || 0) * 100),
      });
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: full ? "REFUNDED" : "PART_REFUNDED" },
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "order.refund",
      entityType: "Order",
      entityId: orderId,
      detail: full ? "Full refund issued" : "Partial refund issued",
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/returns");
}
