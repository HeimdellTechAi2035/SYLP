import { test, expect } from "@playwright/test";
import { TEST_ADMIN, loginAsAdmin } from "./helpers";

test.describe("Admin authentication", () => {
  test("visiting a protected admin URL while logged out redirects to login", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("incorrect admin credentials are rejected", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(TEST_ADMIN.email);
    await page.getByLabel("Password").fill("WrongPassword!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("valid admin login succeeds and the dashboard is reachable", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
