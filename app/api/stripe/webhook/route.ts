import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/orders";
import { notifyAdminOfPaidOrder } from "@/lib/notifications/order-paid";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    // Log the real reason server-side for operators; never echo SDK error
    // detail back to whoever called the endpoint — it's a public URL.
    console.error("Stripe webhook signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await markOrderPaid(orderId);
      // Runs on every delivery of this event, not just the first — its own
      // idempotency (OrderNotification's unique constraint) skips anything
      // already SENT, but will still catch up a notification that never
      // went out (e.g. a transient email-provider failure) on a Stripe
      // webhook retry, rather than requiring a manual admin retry for that.
      await notifyAdminOfPaidOrder(orderId);
    }
  }

  if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED" } }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
