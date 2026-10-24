import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomUUID } from "crypto";

// Proves the admin new-paid-order EMAIL is triggered only by a genuinely
// PAID order (never PENDING/FAILED/expired), is idempotent under a retried
// Stripe webhook, contains everything needed to manufacture/pack/dispatch,
// and that a provider failure never touches the Order itself.

vi.mock("@/lib/email/provider", () => ({
  sendEmail: vi.fn(),
  emailProviderConfigured: vi.fn(() => true),
}));

const { prisma } = await import("@/lib/prisma");
const { sendEmail } = await import("@/lib/email/provider");
const { notifyAdminOfPaidOrder } = await import("@/lib/notifications/order-paid");
const { retryOrderNotifications } = await import("@/lib/actions/admin/notifications");

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
// retryOrderNotifications is admin-gated; give it a real admin session cookie value.
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, requireAdminSession: vi.fn(async () => ({ sub: "test", email: "a@b.com", name: "A", role: "OWNER" })) };
});

const RECIPIENT = "orders@example.com";

async function enableOrderEmails() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { orderNotificationEmailEnabled: true, orderNotificationEmail: RECIPIENT },
    create: { id: 1, orderNotificationEmailEnabled: true, orderNotificationEmail: RECIPIENT },
  });
}

async function orderIn(status: string, overrides: Record<string, unknown> = {}) {
  const id = randomUUID().slice(0, 8);
  return prisma.order.create({
    data: {
      orderNumber: `HM-EMAIL-${id}`,
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "Jones",
      phone: "07123 456789",
      shippingLine1: "10 Example Street",
      shippingCity: "Preston",
      shippingCounty: "Lancashire",
      shippingPostcode: "PR1 1AB",
      shippingCountry: "United Kingdom",
      subtotal: 2200,
      deliveryAmount: 295,
      total: 2495,
      paymentStatus: status,
      fulfilmentStatus: status === "PAID" ? "PAID" : "NEW",
      items: {
        create: [
          {
            productName: "Support Your Local Patriot Hoodie",
            variantLabel: "Large / Black",
            sku: "APP-100",
            unitPrice: 450,
            quantity: 2,
            lineTotal: 900,
          },
          {
            productName: "Support Your Local Patriot Enamel Mug",
            unitPrice: 1300,
            quantity: 1,
            lineTotal: 1300,
          },
        ],
      },
      ...overrides,
    },
    include: { items: true },
  });
}

beforeEach(() => {
  vi.mocked(sendEmail).mockReset();
  vi.mocked(sendEmail).mockResolvedValue({ providerMessageId: "msg_test_123" });
});

describe("admin order email: trigger gating", () => {
  it("1. a PAID order triggers the admin email", async () => {
    await enableOrderEmails();
    const order = await orderIn("PAID");
    await notifyAdminOfPaidOrder(order.id);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("2. a PENDING order does not trigger the admin email", async () => {
    await enableOrderEmails();
    const order = await orderIn("PENDING");
    await notifyAdminOfPaidOrder(order.id);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("3. a FAILED payment does not trigger the admin email", async () => {
    await enableOrderEmails();
    const order = await orderIn("FAILED");
    await notifyAdminOfPaidOrder(order.id);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("4. an expired-checkout order (also stored as FAILED) does not trigger the admin email", async () => {
    // Session expiry sets paymentStatus to FAILED (see app/api/stripe/webhook/route.ts) —
    // same non-PAID gate as test 3, exercised via the actual expiry outcome.
    await enableOrderEmails();
    const order = await orderIn("FAILED", { fulfilmentStatus: "CANCELLED" });
    await notifyAdminOfPaidOrder(order.id);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("5. a 3DS-authenticated paid order follows the exact same PAID notification path (no special-cased code path exists for it)", async () => {
    await enableOrderEmails();
    const order = await orderIn("PAID"); // Stripe abstracts 3DS away — by the time markOrderPaid runs, it's indistinguishable from any other paid order
    await notifyAdminOfPaidOrder(order.id);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("6. a duplicate Stripe webhook delivery does not send a duplicate email", async () => {
    await enableOrderEmails();
    const order = await orderIn("PAID");
    await notifyAdminOfPaidOrder(order.id);
    await notifyAdminOfPaidOrder(order.id); // simulates Stripe retrying delivery
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("does nothing when admin order emails are disabled in settings", async () => {
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: { orderNotificationEmailEnabled: false },
      create: { id: 1, orderNotificationEmailEnabled: false },
    });
    const order = await orderIn("PAID");
    await notifyAdminOfPaidOrder(order.id);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("admin order email: content", () => {
  it("7-13. contains the correct order number, customer, products, variant, quantities, delivery address and total", async () => {
    await enableOrderEmails();
    const order = await orderIn("PAID");
    await notifyAdminOfPaidOrder(order.id);

    const call = vi.mocked(sendEmail).mock.calls[0][0];
    expect(call.to).toBe(RECIPIENT);
    expect(call.subject).toBe(`New Support Your Local Patriot Order — ${order.orderNumber}`);

    // 7. order number
    expect(call.text).toContain(order.orderNumber);
    // 8. customer details
    expect(call.text).toContain("Sarah Jones");
    expect(call.text).toContain("sarah@example.com");
    expect(call.text).toContain("07123 456789");
    // 9. products
    expect(call.text).toContain("Support Your Local Patriot Hoodie");
    expect(call.text).toContain("Support Your Local Patriot Enamel Mug");
    // 10. variant
    expect(call.text).toContain("Large / Black");
    // 11. quantities
    expect(call.text).toContain("2 x Support Your Local Patriot Hoodie");
    expect(call.text).toContain("1 x Support Your Local Patriot Enamel Mug");
    // 12. complete delivery address
    expect(call.text).toContain("10 Example Street");
    expect(call.text).toContain("Preston");
    expect(call.text).toContain("Lancashire");
    expect(call.text).toContain("PR1 1AB");
    expect(call.text).toContain("United Kingdom");
    // 13. total matches Order.total
    expect(call.text).toContain("£24.95");

    // Never card/payment-method secrets
    expect(call.text.toLowerCase()).not.toMatch(/card number|cvc|stripe_secret|whsec_/);
  });
});

describe("admin order email: failure and retry", () => {
  it("14. an email-provider failure does not undo the paid Order", async () => {
    await enableOrderEmails();
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("Provider unreachable"));
    const order = await orderIn("PAID");

    await notifyAdminOfPaidOrder(order.id);

    const stillPaid = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(stillPaid.paymentStatus).toBe("PAID");

    const notification = await prisma.orderNotification.findFirst({ where: { orderId: order.id, channel: "EMAIL" } });
    expect(notification?.status).toBe("FAILED");
  });

  it("15. a failed email can be retried and succeeds once the provider recovers", async () => {
    await enableOrderEmails();
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("Provider unreachable"));
    const order = await orderIn("PAID");
    await notifyAdminOfPaidOrder(order.id);

    let notification = await prisma.orderNotification.findFirst({ where: { orderId: order.id, channel: "EMAIL" } });
    expect(notification?.status).toBe("FAILED");

    vi.mocked(sendEmail).mockResolvedValueOnce({ providerMessageId: "msg_retry_ok" });
    await retryOrderNotifications(order.id);

    notification = await prisma.orderNotification.findFirst({ where: { orderId: order.id, channel: "EMAIL" } });
    expect(notification?.status).toBe("SENT");
    expect(sendEmail).toHaveBeenCalledTimes(2); // original failed attempt + the retry
  });
});
