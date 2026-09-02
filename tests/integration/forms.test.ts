import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");
const { submitReview } = await import("@/lib/actions/reviews");
const { submitContactForm } = await import("@/lib/actions/contact");

describe("submitReview", () => {
  it("creates a review with PENDING status — never immediately visible", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "test-melt-standard" } });
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("customerName", "Review Tester");
    fd.set("customerEmail", "reviewer@example.com");
    fd.set("rating", "5");
    fd.set("body", "Lovely fragrance, would buy again.");

    const result = await submitReview({ status: "idle" }, fd);
    expect(result.status).toBe("success");

    const review = await prisma.review.findFirst({ where: { customerEmail: "reviewer@example.com" } });
    expect(review?.status).toBe("PENDING");
  });

  it("marks a review as a verified purchase only when the email matches a PAID order for that product", async () => {
    // Fixture: existing-customer@example.com has a PAID order for test-melt-standard (HM-TEST1001).
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "test-melt-standard" } });
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("customerName", "Existing Customer");
    fd.set("customerEmail", "existing-customer@example.com");
    fd.set("rating", "4");
    fd.set("body", "Great product.");

    await submitReview({ status: "idle" }, fd);
    const review = await prisma.review.findFirst({
      where: { customerEmail: "existing-customer@example.com", productId: product.id },
    });
    expect(review?.verifiedPurchase).toBe(true);
  });

  it("does not mark a review as verified when there is no matching paid order", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "test-melt-standard" } });
    const email = `never-bought-${randomUUID().slice(0, 8)}@example.com`;
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("customerName", "Never Bought");
    fd.set("customerEmail", email);
    fd.set("rating", "3");
    fd.set("body", "Never actually bought this.");

    await submitReview({ status: "idle" }, fd);
    const review = await prisma.review.findFirst({ where: { customerEmail: email } });
    expect(review?.verifiedPurchase).toBe(false);
  });

  it("rejects a rating outside 1-5", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "test-melt-standard" } });
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("customerName", "Bad Rating");
    fd.set("customerEmail", "badrating@example.com");
    fd.set("rating", "7");
    fd.set("body", "This rating is out of range.");

    const result = await submitReview({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });

  it("rejects a review for a non-existent product without crashing", async () => {
    const fd = new FormData();
    fd.set("productId", "does-not-exist");
    fd.set("customerName", "Ghost");
    fd.set("customerEmail", "ghost@example.com");
    fd.set("rating", "5");
    fd.set("body", "Reviewing a product that doesn't exist.");

    const result = await submitReview({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });

  it("rejects a review missing required fields", async () => {
    const fd = new FormData();
    fd.set("productId", "");
    fd.set("customerName", "");
    fd.set("customerEmail", "not-an-email");
    fd.set("rating", "5");
    fd.set("body", "");

    const result = await submitReview({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });
});

describe("submitContactForm", () => {
  it("persists a valid submission", async () => {
    const fd = new FormData();
    fd.set("name", "Contact Tester");
    fd.set("email", "contact-tester@example.com");
    fd.set("category", "Order question");
    fd.set("message", "Where is my order?");

    const result = await submitContactForm({ status: "idle" }, fd);
    expect(result.status).toBe("success");

    const message = await prisma.contactMessage.findFirst({ where: { email: "contact-tester@example.com" } });
    expect(message).not.toBeNull();
    expect(message?.status).toBe("NEW");
  });

  it("rejects an invalid email address", async () => {
    const fd = new FormData();
    fd.set("name", "Bad Email");
    fd.set("email", "not-an-email");
    fd.set("category", "Other");
    fd.set("message", "Test");

    const result = await submitContactForm({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });

  it("rejects a category outside the fixed allowed list", async () => {
    const fd = new FormData();
    fd.set("name", "Bad Category");
    fd.set("email", "badcategory@example.com");
    fd.set("category", "Not A Real Category");
    fd.set("message", "Test");

    const result = await submitContactForm({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });

  it("rejects an empty message", async () => {
    const fd = new FormData();
    fd.set("name", "Empty Message");
    fd.set("email", "emptymessage@example.com");
    fd.set("category", "Other");
    fd.set("message", "");

    const result = await submitContactForm({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });
});
