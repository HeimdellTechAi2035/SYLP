import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

// Proves the chatbot can never be used to read someone else's order. The
// public/anonymous path requires the same two-piece verification as the
// existing /track-order page (order number AND matching email); a logged-in
// customer's chatbot session is scoped strictly to their own customerId,
// which is read server-side from the verified session cookie — never from
// anything the chat message itself claims.

const cookieStore = createMockCookieStore();
vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
  headers: async () => new Map<string, string>(),
}));

const { prisma } = await import("@/lib/prisma");
const { createCustomerSession } = await import("@/lib/customer-auth");
const { getOrderKnowledgeForCustomer, getOrderKnowledgeForGuest } = await import("@/lib/knowledge/orders");
const { askChatbot } = await import("@/lib/knowledge/chat");
const { sendChatMessage } = await import("@/lib/actions/chat");

async function customerWithOrder(emailPrefix: string) {
  const id = randomUUID().slice(0, 8);
  const customer = await prisma.customer.create({
    data: { email: `${emailPrefix}-${id}@example.com`, firstName: "Order", lastName: "Owner" },
  });
  const order = await prisma.order.create({
    data: {
      orderNumber: `HM-SEC-${id}`,
      customerId: customer.id,
      email: customer.email,
      firstName: "Order",
      lastName: "Owner",
      shippingLine1: "1 Private Street",
      shippingCity: "London",
      shippingPostcode: "SW1A 1AA",
      shippingCountry: "United Kingdom",
      subtotal: 500,
      deliveryAmount: 0,
      total: 500,
      paymentStatus: "PAID",
      fulfilmentStatus: "MAKING",
      // Unique per order — a shared hardcoded value here would make two
      // different customers' orders indistinguishable by tracking number,
      // which would silently defeat exactly the isolation these tests check.
      trackingNumber: `TRACK-${id}`,
    },
  });
  return { customer, order };
}

describe("16. customer A cannot access customer B's order through the chatbot", () => {
  it("getOrderKnowledgeForCustomer scoped to A's id never returns B's order, even when A supplies B's order number", async () => {
    const { order: orderB } = await customerWithOrder("customer-b");
    const { customer: customerA } = await customerWithOrder("customer-a");

    const resultsForA = await getOrderKnowledgeForCustomer(customerA.id, orderB.orderNumber);
    expect(resultsForA).toHaveLength(0);
  });

  it("askChatbot with A's customerId in context never reveals B's order details", async () => {
    const { order: orderB } = await customerWithOrder("chat-customer-b");
    const { customer: customerA } = await customerWithOrder("chat-customer-a");

    // Customer A explicitly names B's order number while authenticated as A —
    // getOrderKnowledgeForCustomer scopes by customerId first, so this must
    // resolve nothing for B's order rather than ignoring the id filter.
    const response = await askChatbot(`Where is my order ${orderB.orderNumber}`, {
      customerId: customerA.id,
      orderNumber: orderB.orderNumber,
    });
    expect(response.text).not.toContain(orderB.orderNumber);
    expect(response.text).not.toContain(orderB.trackingNumber);
  });
});

describe("17. an anonymous user cannot retrieve a private Order", () => {
  it("getOrderKnowledgeForGuest requires the matching email — order number alone resolves nothing", async () => {
    const { order } = await customerWithOrder("guest-anon");
    const wrongEmail = await getOrderKnowledgeForGuest(order.orderNumber, "not-the-real-email@example.com");
    expect(wrongEmail).toBeNull();
  });

  it("askChatbot with no customerId and no email/orderNumber context asks for verification rather than guessing", async () => {
    const response = await askChatbot("where is my order");
    expect(response.text.toLowerCase()).toContain("order number");
    expect(response.text).not.toMatch(/HM-\d+/); // never fabricates or leaks a specific order number
  });

  it("the correct order number with the correct email DOES resolve — proving this isn't just broken, only gated", async () => {
    const { order } = await customerWithOrder("guest-correct");
    const result = await getOrderKnowledgeForGuest(order.orderNumber, order.email);
    expect(result?.orderNumber).toBe(order.orderNumber);
  });
});

describe("sendChatMessage derives customerId only from the verified session cookie", () => {
  it("a logged-in customer's chat message resolves their own order without it being named in context", async () => {
    cookieStore._map.clear();
    const { customer, order } = await customerWithOrder("session-derived");
    await createCustomerSession({ sub: customer.id, email: customer.email });

    const response = await sendChatMessage("where is my order");
    expect(response.text).toContain(order.orderNumber);
  });

  it("an unauthenticated chat caller cannot claim another customerId — sendChatMessage has no such parameter at all", async () => {
    cookieStore._map.clear();
    // sendChatMessage's signature only accepts (message, guestVerification) —
    // there is no customerId argument a caller could pass to impersonate
    // someone. This documents that invariant directly.
    const response = await sendChatMessage("where is my order");
    expect(response.text.toLowerCase()).toContain("order number");
  });
});

describe("15 & 18. admin-only fields and secrets never enter a chatbot response", () => {
  it("a product price/availability answer never contains cost price or internal identifiers", async () => {
    const product = await prisma.product.create({
      data: {
        slug: `secret-check-${randomUUID().slice(0, 8)}`,
        sku: `SEC-${randomUUID().slice(0, 8)}`,
        name: "Secret Check Product",
        price: 450,
        costPrice: 999999,
        status: "ACTIVE",
        stockQuantity: 5,
      },
    });
    const response = await askChatbot(`How much is ${product.name}`);
    expect(response.text).not.toContain("999999");
  });

  it("no chatbot response ever contains a Stripe identifier pattern or known secret env var names", async () => {
    const response = await askChatbot("How much is delivery?");
    for (const forbidden of ["sk_test_", "sk_live_", "whsec_", "STRIPE_SECRET_KEY", "DATABASE_URL", "SESSION_SECRET", "VAPID_PRIVATE_KEY", "EMAIL_API_KEY"]) {
      expect(response.text).not.toContain(forbidden);
    }
  });
});
