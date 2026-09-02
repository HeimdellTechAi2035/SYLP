import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";

// Regression coverage for the confirmed order-number race: the old
// generateOrderNumber(await prisma.order.count()) computed a number from a
// snapshot read immediately before insert, so two concurrent checkouts could
// read the same count() and collide, with the loser throwing an unhandled
// Prisma P2002 straight out of the server action. allocateOrderNumber() now
// increments a dedicated single-row counter (a single atomic upsert
// statement), and createOrderWithUniqueNumber wraps order creation with a
// bounded retry so even a residual clash can never reach the customer.

const { prisma } = await import("@/lib/prisma");
const { allocateOrderNumber, createOrderWithUniqueNumber } = await import("@/lib/order-number");

describe("allocateOrderNumber", () => {
  it("two concurrent allocations never collide", async () => {
    const [a, b] = await Promise.all([allocateOrderNumber(), allocateOrderNumber()]);
    expect(a).not.toBe(b);
  });

  it("10 concurrent allocations all remain unique", async () => {
    const numbers = await Promise.all(Array.from({ length: 10 }, () => allocateOrderNumber()));
    expect(new Set(numbers).size).toBe(10);
  });

  it("does not depend on prisma.order.count() — stays sequential even after the order count changes independently", async () => {
    const first = await allocateOrderNumber();
    const countBeforeExtras = await prisma.order.count();

    // Create several unrelated orders without going through allocateOrderNumber
    // at all — under the old count()-based scheme this would shift what the
    // next generated number "should" be. The dedicated counter must not care.
    for (let i = 0; i < 4; i++) {
      await prisma.order.create({
        data: {
          orderNumber: `HM-UNRELATED-${randomUUID().slice(0, 8)}`,
          email: `count-shift-${randomUUID().slice(0, 8)}@example.com`,
          firstName: "Count",
          lastName: "Shift",
          shippingLine1: "1 Test Street",
          shippingCity: "London",
          shippingPostcode: "SW1A 1AA",
          shippingCountry: "United Kingdom",
          subtotal: 500,
          deliveryAmount: 0,
          total: 500,
          paymentStatus: "PENDING",
          fulfilmentStatus: "NEW",
        },
      });
    }
    expect(await prisma.order.count()).toBe(countBeforeExtras + 4);

    const second = await allocateOrderNumber();
    const firstNum = Number(first.replace("HM-", ""));
    const secondNum = Number(second.replace("HM-", ""));
    expect(secondNum).toBe(firstNum + 1); // advanced by exactly one allocation, not by the 4 extra rows
  });

  it("deleting an order can never cause its number to be reused", async () => {
    const orderNumber = await allocateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: "reuse-check@example.com",
        firstName: "Reuse",
        lastName: "Check",
        shippingLine1: "1 Test Street",
        shippingCity: "London",
        shippingPostcode: "SW1A 1AA",
        shippingCountry: "United Kingdom",
        subtotal: 500,
        deliveryAmount: 0,
        total: 500,
        paymentStatus: "PENDING",
        fulfilmentStatus: "NEW",
      },
    });

    await prisma.order.delete({ where: { id: order.id } });

    const nextNumbers = await Promise.all(Array.from({ length: 5 }, () => allocateOrderNumber()));
    expect(nextNumbers).not.toContain(orderNumber);
  });
});

describe("createOrderWithUniqueNumber", () => {
  it("recovers automatically from a unique-constraint clash instead of surfacing P2002 to the caller", async () => {
    // Learn what number the NEXT allocation will produce, then pre-occupy it
    // with an unrelated order so the first create attempt inside
    // createOrderWithUniqueNumber is guaranteed to collide.
    const consumed = await allocateOrderNumber();
    const nextNumber = `HM-${Number(consumed.replace("HM-", "")) + 1}`;

    await prisma.order.create({
      data: {
        orderNumber: nextNumber,
        email: `pre-occupied-${randomUUID().slice(0, 8)}@example.com`,
        firstName: "Pre",
        lastName: "Occupied",
        shippingLine1: "1 Test Street",
        shippingCity: "London",
        shippingPostcode: "SW1A 1AA",
        shippingCountry: "United Kingdom",
        subtotal: 500,
        deliveryAmount: 0,
        total: 500,
        paymentStatus: "PENDING",
        fulfilmentStatus: "NEW",
      },
    });

    const email = `recovered-${randomUUID().slice(0, 8)}@example.com`;
    const order = await createOrderWithUniqueNumber((orderNumber) =>
      prisma.order.create({
        data: {
          orderNumber,
          email,
          firstName: "Recovered",
          lastName: "Order",
          shippingLine1: "1 Test Street",
          shippingCity: "London",
          shippingPostcode: "SW1A 1AA",
          shippingCountry: "United Kingdom",
          subtotal: 500,
          deliveryAmount: 0,
          total: 500,
          paymentStatus: "PENDING",
          fulfilmentStatus: "NEW",
        },
      })
    );

    // Succeeded without throwing, and was retried onto a fresh, different number.
    expect(order.orderNumber).not.toBe(nextNumber);
    expect(order.email).toBe(email);
  });
});
