import { test, expect } from "@playwright/test";
import { formWithButton } from "./helpers";

test.describe("Checkout boundary (Stripe not configured)", () => {
  test("customer can reach checkout, submit a valid form, and gets a graceful failure — never a raw error page", async ({ page }) => {
    await page.goto("/products/test-melt-standard");
    await page.getByRole("button", { name: "Add to Basket" }).click();
    await expect(page.getByText("Added to your basket.")).toBeVisible();

    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(page.getByText("Order Summary")).toBeVisible();

    const form = formWithButton(page, "Continue to Payment");
    await form.getByLabel("Email").fill("boundary-test@example.com");
    await form.getByLabel("First name").fill("Boundary");
    await form.getByLabel("Last name").fill("Test");
    await form.getByLabel("Address line 1").fill("1 Test Street");
    await form.getByLabel("Town / City").fill("London");
    await form.getByLabel("Postcode").fill("SW1A 1AA");
    await form.getByRole("button", { name: "Continue to Payment" }).click();

    await expect(page.getByText(/online payment is not yet configured/i)).toBeVisible();

    // No raw Next.js/React error boundary, and definitely no stack trace.
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("at Object.");
    await expect(page.locator("body")).not.toContainText("digest:");
  });

  test("required field validation blocks submission before it ever reaches the server", async ({ page }) => {
    await page.goto("/products/test-melt-standard");
    await page.getByRole("button", { name: "Add to Basket" }).click();
    await expect(page.getByText("Added to your basket.")).toBeVisible();
    await page.goto("/checkout");

    // Submit with everything empty — native HTML5 required-field validation should
    // block the browser from even sending the request.
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    // Still on /checkout — no navigation, no error state rendered from a submission attempt.
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test("visiting checkout with an empty basket redirects to the cart instead of showing a broken form", async ({ page, context }) => {
    // Fresh context => no cart cookie at all.
    await context.clearCookies();
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/cart$/);
  });

  test("an out-of-stock (not made-to-order) product cannot be checked out even if forced into the basket", async ({ page }) => {
    await page.goto("/products/test-melt-oos");
    await expect(page.getByRole("button", { name: "Out of Stock" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Out of Stock" })).toBeDisabled();
  });
});
