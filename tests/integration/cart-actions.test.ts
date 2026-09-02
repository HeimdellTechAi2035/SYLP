import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

const cookieStore = createMockCookieStore();

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");
const { addToCart, updateCartItemQuantity, removeCartItem } = await import("@/lib/actions/cart");

async function createCartWithItem(slug: string, quantity: number) {
  const product = await prisma.product.findUniqueOrThrow({ where: { slug } });
  const token = randomUUID();
  const cart = await prisma.cart.create({ data: { token } });
  const item = await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity } });
  return { cart, item, product };
}

beforeEach(() => {
  cookieStore._map.clear();
});

describe("addToCart", () => {
  it("creates a new cart item for a first-time add", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "test-melt-standard" } });
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("quantity", "2");

    await addToCart(fd);

    const token = cookieStore.get("hbm_cart")?.value;
    expect(token).toBeTruthy();
    const cart = await prisma.cart.findUnique({ where: { token }, include: { items: true } });
    expect(cart?.items).toHaveLength(1);
    expect(cart?.items[0].quantity).toBe(2);
  });

  it("increments quantity rather than duplicating the line when the same product is added again", async () => {
    const { product, cart } = await createCartWithItem("test-melt-standard", 1);
    cookieStore.set("hbm_cart", cart.token);

    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("quantity", "3");
    await addToCart(fd);

    const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(4);
  });

  it("rejects a draft (non-ACTIVE) product", async () => {
    const draft = await prisma.product.findUniqueOrThrow({ where: { slug: "test-draft-product" } });
    const fd = new FormData();
    fd.set("productId", draft.id);
    fd.set("quantity", "1");

    await expect(addToCart(fd)).rejects.toThrow(/not available/i);
  });

  it("rejects a missing/invalid product id", async () => {
    const fd = new FormData();
    fd.set("productId", "does-not-exist");
    fd.set("quantity", "1");

    await expect(addToCart(fd)).rejects.toThrow(/not available/i);
  });

  it("rejects an archived product (cannot be purchased after archiving)", async () => {
    const archived = await prisma.product.create({
      data: {
        slug: `archived-${randomUUID().slice(0, 8)}`,
        sku: `ARCH-${randomUUID().slice(0, 8)}`,
        name: "Archived Product",
        price: 500,
        status: "ARCHIVED",
      },
    });
    const fd = new FormData();
    fd.set("productId", archived.id);
    fd.set("quantity", "1");

    await expect(addToCart(fd)).rejects.toThrow(/not available/i);
  });

  it("rejects a malformed/garbage product id without crashing", async () => {
    const fd = new FormData();
    fd.set("productId", "'; DROP TABLE Product; --");
    fd.set("quantity", "1");

    await expect(addToCart(fd)).rejects.toThrow(/not available/i);

    // Confirm the table really is still there and usable.
    const stillWorks = await prisma.product.findUnique({ where: { slug: "test-melt-standard" } });
    expect(stillWorks).not.toBeNull();
  });

  it("clamps a negative quantity up to the minimum of 1, rather than accepting it", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "test-melt-standard" } });
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("quantity", "-5");
    await addToCart(fd);

    const token = cookieStore.get("hbm_cart")?.value;
    const cart = await prisma.cart.findUnique({ where: { token }, include: { items: true } });
    expect(cart?.items[0].quantity).toBe(1);
  });

  it("rejects an unreasonably large quantity rather than accepting it verbatim", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "test-melt-standard" } });
    const fd = new FormData();
    fd.set("productId", product.id);
    fd.set("quantity", "999999999");
    await addToCart(fd);

    const token = cookieStore.get("hbm_cart")?.value;
    const cart = await prisma.cart.findUnique({ where: { token }, include: { items: true } });
    expect(cart?.items[0].quantity).toBeLessThanOrEqual(99);
  });
});

describe("cart item ownership", () => {
  it("lets a visitor update quantity on an item in THEIR OWN cart", async () => {
    const { cart, item } = await createCartWithItem("test-melt-standard", 1);
    cookieStore.set("hbm_cart", cart.token);

    const fd = new FormData();
    fd.set("itemId", item.id);
    fd.set("quantity", "5");
    await updateCartItemQuantity(fd);

    const updated = await prisma.cartItem.findUnique({ where: { id: item.id } });
    expect(updated?.quantity).toBe(5);
  });

  it("does NOT let a visitor update quantity on an item belonging to someone else's cart", async () => {
    const { item: otherPersonsItem } = await createCartWithItem("test-melt-standard", 1);
    // Attacker's own, unrelated cart is the one on the current cookie.
    const attackerCart = await prisma.cart.create({ data: { token: randomUUID() } });
    cookieStore.set("hbm_cart", attackerCart.token);

    const fd = new FormData();
    fd.set("itemId", otherPersonsItem.id);
    fd.set("quantity", "99");
    await updateCartItemQuantity(fd);

    const unchanged = await prisma.cartItem.findUnique({ where: { id: otherPersonsItem.id } });
    expect(unchanged?.quantity).toBe(1); // untouched
  });

  it("does NOT let a visitor remove an item belonging to someone else's cart", async () => {
    const { item: otherPersonsItem } = await createCartWithItem("test-melt-standard", 1);
    const attackerCart = await prisma.cart.create({ data: { token: randomUUID() } });
    cookieStore.set("hbm_cart", attackerCart.token);

    const fd = new FormData();
    fd.set("itemId", otherPersonsItem.id);
    await removeCartItem(fd);

    const stillThere = await prisma.cartItem.findUnique({ where: { id: otherPersonsItem.id } });
    expect(stillThere).not.toBeNull();
  });

  it("does NOT let a visitor with no cart cookie at all mutate an arbitrary item", async () => {
    const { item } = await createCartWithItem("test-melt-standard", 1);
    // no cookie set

    const fd = new FormData();
    fd.set("itemId", item.id);
    await removeCartItem(fd);

    const stillThere = await prisma.cartItem.findUnique({ where: { id: item.id } });
    expect(stillThere).not.toBeNull();
  });

  it("caps an unreasonably large quantity update from the cart page, rather than accepting it verbatim", async () => {
    const { cart, item } = await createCartWithItem("test-melt-standard", 1);
    cookieStore.set("hbm_cart", cart.token);

    const fd = new FormData();
    fd.set("itemId", item.id);
    fd.set("quantity", "999999999");
    await updateCartItemQuantity(fd);

    const updated = await prisma.cartItem.findUnique({ where: { id: item.id } });
    expect(updated?.quantity).toBeLessThanOrEqual(99);
  });

  it("still lets the rightful owner remove their own item", async () => {
    const { cart, item } = await createCartWithItem("test-melt-standard", 1);
    cookieStore.set("hbm_cart", cart.token);

    const fd = new FormData();
    fd.set("itemId", item.id);
    await removeCartItem(fd);

    const gone = await prisma.cartItem.findUnique({ where: { id: item.id } });
    expect(gone).toBeNull();
  });
});
