import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { createMockCookieStore } from "./helpers/mockCookies";

// Extends the Stage 4 admin-authorisation audit to the new notification
// actions/routes, plus proves neither the email API key nor the VAPID
// private key can ever leak through an API response or a recorded error.

const cookieStore = createMockCookieStore();

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/email/provider", () => ({
  sendEmail: vi.fn().mockRejectedValue(new Error("simulated provider failure")),
  emailProviderConfigured: vi.fn(() => true),
}));
// requireAdminSession is left as the REAL implementation (tests 28/29 need its
// genuine cookie-based behaviour) — only getAdminSession is replaced, since
// that's what the route handler in test 30 imports directly.
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, getAdminSession: vi.fn() };
});

const { prisma } = await import("@/lib/prisma");
const { createCustomerSession } = await import("@/lib/customer-auth");
const { retryOrderNotifications, setPushSubscriptionActive } = await import("@/lib/actions/admin/notifications");
const { getAdminSession } = await import("@/lib/auth");
const { POST: subscribeRoute } = await import("@/app/api/admin/push-subscriptions/route");

async function paidOrder() {
  const id = randomUUID().slice(0, 8);
  return prisma.order.create({
    data: {
      orderNumber: `HM-SEC-${id}`,
      email: `sec-${id}@example.com`,
      firstName: "Sec",
      lastName: "Audit",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "SW1A 1AA",
      shippingCountry: "United Kingdom",
      subtotal: 500,
      deliveryAmount: 0,
      total: 500,
      paymentStatus: "PAID",
      fulfilmentStatus: "PAID",
    },
  });
}

describe("28 & 29. retryOrderNotifications requires a genuine admin session", () => {
  it("an unauthenticated caller cannot retry notifications", async () => {
    cookieStore._map.clear();
    const order = await paidOrder();
    await expect(retryOrderNotifications(order.id)).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });

  it("a logged-in CUSTOMER (not admin) cannot retry notifications", async () => {
    cookieStore._map.clear();
    const customer = await prisma.customer.upsert({
      where: { email: "notif-security-customer@example.com" },
      update: {},
      create: { email: "notif-security-customer@example.com", firstName: "Notif", lastName: "Customer" },
    });
    await createCustomerSession({ sub: customer.id, email: customer.email });
    const order = await paidOrder();

    await expect(retryOrderNotifications(order.id)).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });

  it("setPushSubscriptionActive is also admin-gated", async () => {
    cookieStore._map.clear();
    await expect(setPushSubscriptionActive(new FormData())).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });
});

describe("30. provider/VAPID secrets never appear in API responses", () => {
  it("a push-subscription API response never contains the VAPID private key or email API key", async () => {
    const fakePrivateKey = "vapid-private-key-should-never-leak-1234567890";
    const fakeEmailKey = "re_should_never_leak_9876543210";
    const originalVapid = process.env.VAPID_PRIVATE_KEY;
    const originalEmail = process.env.EMAIL_API_KEY;
    process.env.VAPID_PRIVATE_KEY = fakePrivateKey;
    process.env.EMAIL_API_KEY = fakeEmailKey;

    try {
      const admin = await prisma.adminUser.findFirstOrThrow();
      vi.mocked(getAdminSession).mockResolvedValueOnce({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role, mustChangePassword: false });

      const request = new NextRequest("http://localhost/api/admin/push-subscriptions", {
        method: "POST",
        body: JSON.stringify({ endpoint: `https://push.example.com/${randomUUID()}`, keys: { p256dh: "k", auth: "a" } }),
      });
      const res = await subscribeRoute(request);
      const bodyText = await res.text();

      expect(bodyText).not.toContain(fakePrivateKey);
      expect(bodyText).not.toContain(fakeEmailKey);
    } finally {
      process.env.VAPID_PRIVATE_KEY = originalVapid;
      process.env.EMAIL_API_KEY = originalEmail;
    }
  });

  it("a sanitized notification error message never contains a long secret-shaped token", async () => {
    const { notifyAdminOfPaidOrder } = await import("@/lib/notifications/order-paid");
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: { orderNotificationEmailEnabled: true, orderNotificationEmail: "leak-check@example.com" },
      create: { id: 1, orderNotificationEmailEnabled: true, orderNotificationEmail: "leak-check@example.com" },
    });
    const order = await paidOrder();

    await notifyAdminOfPaidOrder(order.id); // the mocked sendEmail above always rejects

    const notification = await prisma.orderNotification.findFirstOrThrow({ where: { orderId: order.id, channel: "EMAIL" } });
    expect(notification.status).toBe("FAILED");
    // sanitizeErrorMessage redacts any token-shaped run of 20+ id/key characters.
    expect(notification.errorMessage).not.toMatch(/[A-Za-z0-9_-]{20,}/);
  });
});
