import { prisma } from "@/lib/prisma";

/**
 * Marks an order paid and applies its side effects (stock decrement, discount usage).
 * Idempotent — safe to call from both the Stripe webhook and the confirmation page,
 * since Stripe may retry webhook delivery and the confirmation page may load before
 * (or after) the webhook has been processed.
 */
export async function markOrderPaid(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.paymentStatus === "PAID") return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", fulfilmentStatus: "PAID" },
    });

    for (const item of order.items) {
      // Made-to-order products have no finite stock to track — Mia makes
      // more as orders arrive, so a paid order never touches stockQuantity.
      if (item.product?.madeToOrder) continue;

      if (item.variantId) {
        await tx.productVariant
          .update({ where: { id: item.variantId }, data: { stockQuantity: { decrement: item.quantity } } })
          .catch(() => {});
      } else if (item.productId) {
        await tx.product
          .update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } })
          .catch(() => {});
      }
    }

    if (order.discountCode) {
      await tx.discount
        .update({ where: { code: order.discountCode }, data: { timesUsed: { increment: 1 } } })
        .catch(() => {});
    }
  });
}
