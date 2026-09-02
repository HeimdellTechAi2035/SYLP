import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

// Extends the customer-isolation coverage already proven at the browser level
// in e2e/customer-account.spec.ts (order access) to the address-deletion
// action, which hadn't been directly tested before this audit.

const cookieStore = createMockCookieStore();

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");
const { createCustomerSession } = await import("@/lib/customer-auth");
const { deleteAddress } = await import("@/lib/actions/addresses");

async function customerWithAddress(emailPrefix: string) {
  const customer = await prisma.customer.create({
    data: { email: `${emailPrefix}-${randomUUID().slice(0, 8)}@example.com`, firstName: "Iso", lastName: "Test" },
  });
  const address = await prisma.address.create({
    data: { customerId: customer.id, line1: "1 Private Street", city: "London", postcode: "SW1A 1AA" },
  });
  return { customer, address };
}

describe("customer data isolation: addresses", () => {
  it("customer B cannot delete customer A's saved address, even knowing its id", async () => {
    const { address: addressA } = await customerWithAddress("iso-a");
    const { customer: customerB } = await customerWithAddress("iso-b");

    cookieStore._map.clear();
    await createCustomerSession({ sub: customerB.id, email: customerB.email });

    const fd = new FormData();
    fd.set("addressId", addressA.id);
    await deleteAddress(fd);

    const stillExists = await prisma.address.findUnique({ where: { id: addressA.id } });
    expect(stillExists).not.toBeNull();
  });

  it("customer A can still delete their own address", async () => {
    const { customer: customerA, address: addressA } = await customerWithAddress("iso-c");

    cookieStore._map.clear();
    await createCustomerSession({ sub: customerA.id, email: customerA.email });

    const fd = new FormData();
    fd.set("addressId", addressA.id);
    await deleteAddress(fd);

    const gone = await prisma.address.findUnique({ where: { id: addressA.id } });
    expect(gone).toBeNull();
  });

  it("an unauthenticated caller cannot delete any address", async () => {
    const { address } = await customerWithAddress("iso-d");
    cookieStore._map.clear(); // no session at all

    const fd = new FormData();
    fd.set("addressId", address.id);
    await deleteAddress(fd);

    const stillExists = await prisma.address.findUnique({ where: { id: address.id } });
    expect(stillExists).not.toBeNull();
  });
});
