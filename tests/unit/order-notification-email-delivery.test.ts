import { describe, it, expect } from "vitest";
import { buildOrderNotificationEmail } from "@/lib/email/order-notification";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

function order(overrides: Record<string, unknown> = {}): OrderWithItems {
  return {
    id: "order_1",
    orderNumber: "HM-1014",
    createdAt: new Date("2026-01-01T12:00:00Z"),
    paymentStatus: "PAID",
    email: "sarah@example.com",
    firstName: "Sarah",
    lastName: "Jones",
    phone: null,
    subtotal: 2200,
    discountCode: null,
    discountAmount: 0,
    deliveryAmount: 295,
    deliveryMethodName: "Standard Delivery",
    total: 2495,
    estimatedPostageCost: 270,
    packagingCost: 65,
    shippingLine1: "10 Example Street",
    shippingLine2: null,
    shippingCity: "Preston",
    shippingCounty: "Lancashire",
    shippingPostcode: "PR1 1AB",
    shippingCountry: "United Kingdom",
    giftMessage: null,
    items: [],
    ...overrides,
  } as unknown as OrderWithItems;
}

describe("11. admin order email contains the customer delivery method and charge", () => {
  it("includes the delivery method name and what the customer paid", () => {
    const { text } = buildOrderNotificationEmail(order(), "http://localhost:3000");
    expect(text).toContain("Standard Delivery");
    expect(text).toContain("£2.95");
  });

  it("shows 'Free' rather than £0.00 when free delivery applied, while the admin-only section still shows real internal costs", () => {
    const { text } = buildOrderNotificationEmail(order({ deliveryAmount: 0 }), "http://localhost:3000");
    expect(text).toMatch(/Customer paid delivery:\s*\nFree/);
    expect(text).toContain("£2.70"); // estimated postage, admin-only section
    expect(text).toContain("£0.65"); // packaging, admin-only section
  });

  it("keeps the admin-only fulfilment summary clearly separated and labelled", () => {
    const { text } = buildOrderNotificationEmail(order(), "http://localhost:3000");
    expect(text).toContain("Admin-only fulfilment summary");
  });
});
