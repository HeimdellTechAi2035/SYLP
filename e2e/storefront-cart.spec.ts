import { test, expect } from "@playwright/test";

test.describe("Core storefront + cart journey", () => {
  test("homepage -> shop -> product -> add to cart -> update -> remove -> empty state", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /HandMade by Mia/i }).first()).toBeVisible();

    await page.getByRole("link", { name: "Shop", exact: true }).first().click();
    await page.waitForURL("**/shop");

    await page.getByRole("link", { name: /Test Melt Standard/i }).click();
    await page.waitForURL("**/products/test-melt-standard");
    await expect(page.getByRole("heading", { name: "Test Melt Standard" })).toBeVisible();

    await page.getByRole("button", { name: "Add to Basket" }).click();
    await expect(page.getByText("Added to your basket.")).toBeVisible();

    // Basket icon reflects the new count.
    await expect(page.getByRole("link", { name: /Basket, 1 item/i })).toBeVisible();

    await page.getByRole("link", { name: /Basket, 1 item/i }).click();
    await page.waitForURL("**/cart");
    // Scoped to the link role, not plain text — Next's built-in route
    // announcer (an accessibility live-region) can transiently contain the
    // same text as the page title, which would otherwise make this ambiguous.
    await expect(page.getByRole("link", { name: "Test Melt Standard" })).toBeVisible();
    await expect(page.getByText("£5.00").first()).toBeVisible();

    // Update quantity and confirm the line + subtotal both update.
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByText("£10.00").first()).toBeVisible();

    // Refresh — cart must persist via the cookie-backed server cart, not client state.
    await page.reload();
    // Scoped to the link role, not plain text — Next's built-in route
    // announcer (an accessibility live-region) can transiently contain the
    // same text as the page title, which would otherwise make this ambiguous.
    await expect(page.getByRole("link", { name: "Test Melt Standard" })).toBeVisible();
    await expect(page.getByText("£10.00").first()).toBeVisible();

    // Remove the item and confirm the empty-basket state.
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByRole("heading", { name: "Your basket is empty" })).toBeVisible();
  });
});

test.describe("Multi-product cart", () => {
  test("two different products keep independent lines, quantities and correct subtotal arithmetic", async ({ page }) => {
    await page.goto("/products/test-melt-standard"); // price £5.00
    await page.getByRole("button", { name: "Add to Basket" }).click();
    await expect(page.getByText("Added to your basket.")).toBeVisible();

    await page.goto("/products/test-candle-variant"); // base £15.00, variant override £18.00
    await page.getByRole("button", { name: "Add to Basket" }).click();
    await expect(page.getByText("Added to your basket.")).toBeVisible();

    await page.goto("/cart");
    // Scoped to the link role, not plain text — Next's built-in route
    // announcer (an accessibility live-region) can transiently contain the
    // same text as the page title, which would otherwise make this ambiguous.
    await expect(page.getByRole("link", { name: "Test Melt Standard" })).toBeVisible();
    await expect(page.getByText("Test Candle With Variant")).toBeVisible();

    // Default variant is "Test Candle — Large" (price override £18.00), selected by AddToCartForm's default.
    await expect(page.getByText("Test Candle — Large")).toBeVisible();

    // Subtotal = £5.00 (melt) + £18.00 (candle variant override) = £23.00
    await expect(page.getByText("£23.00")).toBeVisible();

    // Increasing the melt's quantity must not affect the candle's line.
    const meltRow = page.locator("li", { hasText: "Test Melt Standard" });
    await meltRow.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByText("Test Candle — Large")).toBeVisible(); // candle line untouched
    // New subtotal = £10.00 (melt x2) + £18.00 (candle) = £28.00
    await expect(page.getByText("£28.00")).toBeVisible();
  });
});
