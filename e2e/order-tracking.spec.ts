import { test, expect } from "@playwright/test";

test.describe("Order tracking", () => {
  test("correct order number + matching email shows the order", async ({ page }) => {
    await page.goto("/track-order");
    await page.getByPlaceholder(/order number/i).fill("HM-TEST1001");
    await page.getByPlaceholder(/email address/i).fill("existing-customer@example.com");
    await page.getByRole("button", { name: "Track" }).click();

    await expect(page.getByText("HM-TEST1001")).toBeVisible();
    await expect(page.getByText(/test melt standard/i)).toBeVisible();
  });

  test("correct order number + WRONG email is rejected, not shown", async ({ page }) => {
    await page.goto("/track-order");
    await page.getByPlaceholder(/order number/i).fill("HM-TEST1001");
    await page.getByPlaceholder(/email address/i).fill("wrong-person@example.com");
    await page.getByRole("button", { name: "Track" }).click();

    await expect(page.getByText(/couldn.t find an order/i)).toBeVisible();
    await expect(page.getByText(/test melt standard/i)).not.toBeVisible();
  });

  test("a completely invalid order number is rejected cleanly", async ({ page }) => {
    await page.goto("/track-order");
    await page.getByPlaceholder(/order number/i).fill("HM-DOES-NOT-EXIST");
    await page.getByPlaceholder(/email address/i).fill("existing-customer@example.com");
    await page.getByRole("button", { name: "Track" }).click();

    await expect(page.getByText(/couldn.t find an order/i)).toBeVisible();
  });
});
