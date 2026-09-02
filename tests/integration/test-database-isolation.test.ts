import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";

describe("test database wiring (smoke test)", () => {
  it("connects to the isolated test.db, not dev.db", async () => {
    expect(process.env.DATABASE_URL).toContain("test.db");
    const product = await prisma.product.findUnique({ where: { slug: "test-melt-standard" } });
    expect(product).not.toBeNull();
    expect(product?.name).toBe("Test Melt Standard");
  });
});
