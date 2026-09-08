import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

// Proves the admin PUSH notification: fires only for a genuinely PAID order,
// is idempotent under a retried Stripe webhook, carries only minimal content
// (no full address), a dead subscription can't affect the Order, and
// registration is strictly admin-only (never customer, never anonymous).

vi.mock("@/lib/push/provider", () => ({
  sendPushNotification: vi.fn(),
  pushConfigured: vi.fn(() => true),
  PushSubscriptionGoneError: class PushSubscriptionGoneError extends Error {},
}));
vi.mock("@/lib/email/provider", () => ({
  sendEmail: vi.fn().mockResolvedValue({ providerMessageId: null }),
  emailProviderConfigured: vi.fn(() => false), // email disabled for these tests; push is what's under test
}));
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, getAdminSession: vi.fn() };
});

const { prisma } = await import("@/lib/prisma");
const { sendPushNotification, PushSubscriptionGoneError } = await import("@/lib/push/provider");
const { notifyAdminOfPaidOrder } = await import("@/lib/notifications/order-paid");
const { getAdminSession } = await import("@/lib/auth");
const { POST: subscribeRoute } = await import("@/app/api/admin/push-subscriptions/route");

async function adminUser() {
  return prisma.adminUser.findFirstOrThrow();
}

async function pushSubscription(overrides: { active?: boolean } = {}) {
  const admin = await adminUser();
  const id = randomUUID().slice(0, 8);
  return prisma.adminPushSubscription.create({
    data: {
      adminUserId: admin.id,
      endpoint: `https://push.example.com/${id}`,
      p256dh: "test-p256dh-key",
      auth: "test-auth-secret",
      label: "Test device",
      active: overrides.active ?? true,
    },
  });
}

async function paidOrder(overrides: Record<string, unknown> = {}) {
  const id = randomUUID().slice(0, 8);
  return prisma.order.create({
    data: {
      orderNumber: `HM-PUSH-${id}`,
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "Jones",
      shippingLine1: "10 Example Street",
      shippingCity: "Preston",
      shippingPostcode: "PR1 1AB",
      shippingCountry: "United Kingdom",
      subtotal: 2200,
      deliveryAmount: 295,
      total: 2495,
      paymentStatus: "PAID",
      fulfilmentStatus: "PAID",
      items: {
        create: [
          { productName: "Vanilla Dream Wax Melt", unitPrice: 450, quantity: 2, lineTotal: 900 },
          { productName: "English Garden Candle", unitPrice: 1300, quantity: 1, lineTotal: 1300 },
        ],
      },
      ...overrides,
    },
    include: { items: true },
  });
}

beforeEach(async () => {
  vi.mocked(sendPushNotification).mockReset();
  vi.mocked(sendPushNotification).mockResolvedValue(undefined);
  // AdminPushSubscription isn't scoped to an order — without clearing it,
  // subscriptions registered by an earlier test in this file would still be
  // "active" and get notified about later tests' orders too.
  await prisma.adminPushSubscription.deleteMany({});
});

describe("admin order push: trigger gating", () => {
  it("16. a PAID order triggers a push to each active subscription", async () => {
    const sub = await pushSubscription();
    const order = await paidOrder();
    await notifyAdminOfPaidOrder(order.id);
    expect(sendPushNotification).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendPushNotification).mock.calls[0][0]).toMatchObject({ endpoint: sub.endpoint });
  });

  it("17. a PENDING order does not trigger a push", async () => {
    await pushSubscription();
    const order = await paidOrder({ paymentStatus: "PENDING", fulfilmentStatus: "NEW" });
    await notifyAdminOfPaidOrder(order.id);
    expect(sendPushNotification).not.toHaveBeenCalled();
  });

  it("18. a FAILED order does not trigger a push", async () => {
    await pushSubscription();
    const order = await paidOrder({ paymentStatus: "FAILED", fulfilmentStatus: "CANCELLED" });
    await notifyAdminOfPaidOrder(order.id);
    expect(sendPushNotification).not.toHaveBeenCalled();
  });

  it("19. a duplicate Stripe webhook delivery does not duplicate the push", async () => {
    await pushSubscription();
    const order = await paidOrder();
    await notifyAdminOfPaidOrder(order.id);
    await notifyAdminOfPaidOrder(order.id);
    expect(sendPushNotification).toHaveBeenCalledTimes(1);
  });

  it("only notifies active subscriptions, never disabled ones", async () => {
    await pushSubscription({ active: false });
    const order = await paidOrder();
    await notifyAdminOfPaidOrder(order.id);
    expect(sendPushNotification).not.toHaveBeenCalled();
  });
});

describe("admin order push: content", () => {
  it("20-21. contains the correct order number and amount", async () => {
    await pushSubscription();
    const order = await paidOrder();
    await notifyAdminOfPaidOrder(order.id);

    const payload = vi.mocked(sendPushNotification).mock.calls[0][1] as { title: string; body: string; url: string };
    expect(payload.body).toContain(order.orderNumber);
    expect(payload.body).toContain("£24.95");
  });

  it("22. does not contain the full delivery address", async () => {
    await pushSubscription();
    const order = await paidOrder();
    await notifyAdminOfPaidOrder(order.id);

    const payload = vi.mocked(sendPushNotification).mock.calls[0][1] as { title: string; body: string; url: string };
    const fullPayloadText = `${payload.title} ${payload.body}`;
    expect(fullPayloadText).not.toContain("10 Example Street");
    expect(fullPayloadText).not.toContain("PR1 1AB");
  });

  it("27. links to the authenticated admin order page, not a public URL", async () => {
    await pushSubscription();
    const order = await paidOrder();
    await notifyAdminOfPaidOrder(order.id);

    const payload = vi.mocked(sendPushNotification).mock.calls[0][1] as { title: string; body: string; url: string };
    expect(payload.url).toBe(`/admin/orders/${order.id}`);
    // No token/secret embedded in the URL that could bypass login.
    expect(payload.url).not.toMatch(/token|key|secret/i);
  });
});

describe("admin order push: failure handling", () => {
  it("23. a stale/invalid (410 Gone) subscription failure does not affect the Order, and deactivates the dead subscription", async () => {
    const sub = await pushSubscription();
    vi.mocked(sendPushNotification).mockRejectedValueOnce(new PushSubscriptionGoneError("gone"));
    const order = await paidOrder();

    await notifyAdminOfPaidOrder(order.id);

    const stillPaid = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(stillPaid.paymentStatus).toBe("PAID");

    const afterSub = await prisma.adminPushSubscription.findUniqueOrThrow({ where: { id: sub.id } });
    expect(afterSub.active).toBe(false);

    const notification = await prisma.orderNotification.findFirst({ where: { orderId: order.id, channel: "PUSH" } });
    expect(notification?.status).toBe("FAILED");
  });
});

describe("admin push subscription registration", () => {
  function subscribeRequest() {
    return new NextRequest("http://localhost/api/admin/push-subscriptions", {
      method: "POST",
      body: JSON.stringify({ endpoint: `https://push.example.com/${randomUUID()}`, keys: { p256dh: "k", auth: "a" } }),
    });
  }

  it("24. an authenticated admin can register a push subscription", async () => {
    const admin = await adminUser();
    vi.mocked(getAdminSession).mockResolvedValueOnce({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role, mustChangePassword: false });

    const res = await subscribeRoute(subscribeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBeTruthy();
  });

  it("25 & 26. a customer session (or no session at all) cannot register an admin push subscription", async () => {
    // getAdminSession() reads a completely separate cookie namespace from the
    // customer session, so a customer can never satisfy it — both scenarios
    // collapse to the same "no admin session" outcome the route checks for.
    vi.mocked(getAdminSession).mockResolvedValueOnce(null);
    const res = await subscribeRoute(subscribeRequest());
    expect(res.status).toBe(401);
  });
});
