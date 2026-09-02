import { test, expect } from "@playwright/test";
import { EXISTING_CUSTOMER, loginAsCustomer } from "./helpers";

test.describe("Customer account", () => {
  test("register, logout, login, wrong password, dashboard", async ({ page }) => {
    const email = `e2e-customer-${Date.now()}@example.com`;

    await page.goto("/account");
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.getByLabel("First name").fill("E2E");
    await page.getByLabel("Last name").fill("Customer");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("BrandNewPass123!");
    // "Create Account" also names the tab-switch button above the form — scope
    // to the form itself to reach only the actual submit button.
    await page.locator("form").getByRole("button", { name: "Create Account", exact: true }).click();

    // Registration logs the customer straight in.
    await expect(page.getByText(/welcome back/i)).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.locator("form").getByRole("button", { name: "Sign In", exact: true })).toBeVisible();

    // Wrong password is rejected.
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("TotallyWrongPassword!");
    await page.locator("form").getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page.getByText(/incorrect email or password/i)).toBeVisible();

    // Correct password succeeds. React resets uncontrolled form fields after
    // the previous action completed, so both fields need refilling, not just
    // the one that changed.
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("BrandNewPass123!");
    await page.locator("form").getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test("address creation and removal", async ({ page }) => {
    await loginAsCustomer(page, EXISTING_CUSTOMER.email, EXISTING_CUSTOMER.password);
    await page.goto("/account/addresses");

    await page.getByPlaceholder("Address line 1").fill("42 E2E Test Avenue");
    await page.getByPlaceholder("Town / City").fill("Manchester");
    await page.getByPlaceholder("Postcode").fill("M1 1AA");
    await page.getByRole("button", { name: "Save Address" }).click();

    await expect(page.getByText("42 E2E Test Avenue")).toBeVisible();

    await page.locator("li", { hasText: "42 E2E Test Avenue" }).getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("42 E2E Test Avenue")).not.toBeVisible();
  });

  test("order history is visible and shows the fixture order", async ({ page }) => {
    await loginAsCustomer(page, EXISTING_CUSTOMER.email, EXISTING_CUSTOMER.password);
    await page.goto("/account/orders");
    await expect(page.getByText("HM-TEST1001")).toBeVisible();

    await page.getByText("HM-TEST1001").click();
    await expect(page.getByRole("heading", { name: /HM-TEST1001/ })).toBeVisible();
  });

  test("a customer cannot view another customer's order by guessing its URL", async ({ page }) => {
    await loginAsCustomer(page, EXISTING_CUSTOMER.email, EXISTING_CUSTOMER.password);

    // Grab the real order id from the account's own order list link.
    await page.goto("/account/orders");
    const href = await page.getByRole("link", { name: /HM-TEST1001/ }).getAttribute("href");
    expect(href).toBeTruthy();

    // Log out and in as a completely different customer, then try that same URL.
    await page.goto("/account");
    await page.getByRole("button", { name: "Sign out" }).click();
    // Wait for the session to actually be cleared before navigating again —
    // otherwise a fresh page load can still race the cookie-deletion response
    // and land on the still-logged-in dashboard instead of the login form.
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
    await loginAsCustomer(page, "other-customer@example.com", "OtherPass123!");

    await page.goto(href!);
    // Next's not-found page renders two separate headings ("404" and "This
    // page could not be found.") — match just one to avoid ambiguity.
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
