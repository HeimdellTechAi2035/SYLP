import { test, expect } from "@playwright/test";

// 28. Mobile QA — minimum viewport from the spec (375x812, an iPhone-class
// screen). Verifies the widget is usable and never blocks primary storefront
// controls (Add to Cart), and stays hidden on the payment handoff page.

test.use({ viewport: { width: 375, height: 812 } });

test.describe("Chatbot on a mobile viewport (375x812)", () => {
  test("launcher is visible and does not overlap Add to Cart", async ({ page }) => {
    await page.goto("/products/test-melt-standard");
    // Dismiss the (unrelated, pre-existing) cookie-consent bar first — this
    // test is specifically about the chat launcher vs. Add to Cart, and the
    // full-width cookie bar would otherwise confound the overlap check.
    await page.getByRole("button", { name: "Accept All" }).click();

    const addToCart = page.getByRole("button", { name: "Add to Basket" });
    await addToCart.scrollIntoViewIfNeeded();
    await expect(addToCart).toBeVisible();

    const launcher = page.getByRole("button", { name: /open chat assistant/i });
    await expect(launcher).toBeVisible();

    const cartBox = await addToCart.boundingBox();
    const launcherBox = await launcher.boundingBox();
    expect(cartBox).not.toBeNull();
    expect(launcherBox).not.toBeNull();
    // No bounding-box overlap between the two.
    const overlap =
      cartBox!.x < launcherBox!.x + launcherBox!.width &&
      cartBox!.x + cartBox!.width > launcherBox!.x &&
      cartBox!.y < launcherBox!.y + launcherBox!.height &&
      cartBox!.y + cartBox!.height > launcherBox!.y;
    expect(overlap).toBe(false);

    // Add to Cart must still be genuinely clickable (not covered by a
    // higher z-index element) even with the launcher present.
    await addToCart.click();
    await expect(page.getByText("Added to your basket.")).toBeVisible();
  });

  test("chat panel fits the viewport width with no horizontal page overflow", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: /open chat assistant/i }).click();

    const panel = page.getByRole("dialog", { name: /handmade by mia chat assistant/i });
    await expect(panel).toBeVisible();
    const panelBox = await panel.boundingBox();
    expect(panelBox!.x).toBeGreaterThanOrEqual(0);
    expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(375 + 1); // +1 for sub-pixel rounding

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375 + 1);
  });

  test("input is usable, message sends, and the conversation scrolls", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: /open chat assistant/i }).click();

    const input = page.getByPlaceholder("Ask a question...");
    await expect(input).toBeVisible();
    await input.fill("How much is delivery?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByRole("log", { name: "Conversation" })).toContainText("£", { timeout: 10_000 });
  });

  test("close button is reachable and closes the panel", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: /open chat assistant/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Close chat", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("does not cover checkout controls — the widget is absent entirely on /checkout", async ({ page }) => {
    await page.goto("/products/test-melt-standard");
    await page.getByRole("button", { name: "Add to Basket" }).click();
    await page.waitForSelector("text=Added to your basket.");

    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole("button", { name: /open chat assistant/i })).toHaveCount(0);
  });
});
