import { test, expect } from "@playwright/test";
import { loginAsAdmin, formWithButton } from "./helpers";

test.describe("Admin product lifecycle", () => {
  test("create -> visible publicly -> edit -> change reflects -> archive -> hidden publicly -> record still exists in admin", async ({ page }) => {
    await loginAsAdmin(page);

    const slug = `e2e-test-product-${Date.now()}`;
    await page.goto("/admin/products/new");
    await page.getByLabel("Product name").fill("E2E Test Product");
    await page.getByLabel("Slug (URL)").fill(slug);
    await page.getByLabel("SKU").fill(`E2E-${Date.now()}`);
    await page.getByLabel("Status").selectOption("ACTIVE");
    await page.getByLabel("Price (£)", { exact: true }).fill("9.99");
    await page.getByRole("button", { name: "Create Product" }).click();

    await page.waitForURL(/\/admin\/products\/.+\/edit/);
    await expect(page.getByRole("heading", { name: /E2E Test Product/ })).toBeVisible();

    // Publicly visible now that it's Active.
    await page.goto(`/products/${slug}`);
    await expect(page.getByRole("heading", { name: "E2E Test Product" })).toBeVisible();
    await expect(page.getByText("£9.99")).toBeVisible();

    // Edit — change the name and price.
    await page.goto("/admin/products");
    await page.getByRole("link", { name: /E2E Test Product/ }).click();
    await page.getByLabel("Product name").fill("E2E Test Product (Edited)");
    await page.getByLabel("Price (£)", { exact: true }).fill("12.50");
    await formWithButton(page, "Save Changes").getByRole("button", { name: "Save Changes" }).click();

    // Saving doesn't redirect — it revalidates this same edit page in place.
    // Wait for that update to actually land before navigating away, otherwise
    // the public-page check below can race ahead of the write completing.
    await expect(page.getByRole("heading", { name: "Edit: E2E Test Product (Edited)" })).toBeVisible({ timeout: 15_000 });

    await page.goto(`/products/${slug}`);
    await expect(page.getByRole("heading", { name: "E2E Test Product (Edited)" })).toBeVisible();
    await expect(page.getByText("£12.50")).toBeVisible();

    // Archive — a soft status change, not a permanent delete.
    await page.goto("/admin/products");
    const row = page.locator("tr", { hasText: "E2E Test Product (Edited)" });
    await row.getByRole("button", { name: "Archive" }).click();
    // Doesn't redirect — revalidates this same list in place. Wait for the
    // status badge to actually flip before checking the public page.
    await expect(row.getByText("ARCHIVED", { exact: true })).toBeVisible({ timeout: 15_000 });

    // No longer publicly reachable. Next's not-found page renders two separate
    // headings ("404" and "This page could not be found.") — match just one.
    await page.goto(`/products/${slug}`);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    // But the record is still there in Admin, just marked Archived.
    await page.goto("/admin/products");
    await expect(page.getByText("E2E Test Product (Edited)")).toBeVisible();
    await expect(page.locator("tr", { hasText: "E2E Test Product (Edited)" }).getByText("ARCHIVED", { exact: true })).toBeVisible();
  });
});

test.describe("Admin category and fragrance management", () => {
  test("create and edit a test-only category", async ({ page }) => {
    await loginAsAdmin(page);
    const slug = `e2e-category-${Date.now()}`;

    await page.goto("/admin/categories");
    const addForm = formWithButton(page, "Add Category");
    await addForm.getByLabel("Name").fill("E2E Test Category");
    await addForm.getByLabel("Slug").fill(slug);
    await addForm.getByRole("button", { name: "Add Category" }).click();

    await expect(page.getByText("E2E Test Category")).toBeVisible();

    // It's also selectable on the product form now.
    await page.goto("/admin/products/new");
    await expect(page.getByLabel("Category").locator("option", { hasText: "E2E Test Category" })).toHaveCount(1);
  });

  test("create and edit a test-only fragrance", async ({ page }) => {
    await loginAsAdmin(page);
    const slug = `e2e-fragrance-${Date.now()}`;

    await page.goto("/admin/fragrances");
    const addForm = formWithButton(page, "Add Fragrance");
    await addForm.getByLabel("Name").fill("E2E Test Fragrance");
    await addForm.getByLabel("Slug").fill(slug);
    await addForm.getByLabel("Scent family").fill("Fresh");
    await addForm.getByRole("button", { name: "Add Fragrance" }).click();

    await expect(page.getByText("E2E Test Fragrance")).toBeVisible();
  });
});
