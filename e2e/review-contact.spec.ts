import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("Review moderation", () => {
  test("a submitted review is pending, invisible publicly, then approved -> visible; a second one rejected -> stays hidden", async ({ page }) => {
    const uniqueBody = `E2E review body ${Date.now()}`;

    await page.goto("/products/test-melt-standard");
    await page.getByText(/^Reviews \(/).click();
    await page.getByLabel("Name").fill("E2E Reviewer");
    await page.getByLabel("Email (not published)").fill("e2e-reviewer@example.com");
    await page.getByLabel(/^5 stars$/).click();
    await page.getByLabel("Your review").fill(uniqueBody);
    await page.getByRole("button", { name: "Submit Review" }).click();

    await expect(page.getByText(/submitted and will appear once approved/i)).toBeVisible();

    // Not visible publicly yet — reload the product page fresh.
    await page.goto("/products/test-melt-standard");
    await expect(page.getByText(uniqueBody)).not.toBeVisible();

    // Approve it in Admin.
    await loginAsAdmin(page);
    await page.goto("/admin/reviews");
    const reviewCard = page.locator("div", { hasText: uniqueBody }).last();
    await reviewCard.getByRole("button", { name: "Approve" }).click();
    // Doesn't redirect — revalidates this same admin page in place. Wait for
    // that to land before navigating away to check the public product page.
    await expect(reviewCard.getByText("APPROVED", { exact: true })).toBeVisible({ timeout: 15_000 });

    await page.goto("/products/test-melt-standard");
    await page.getByText(/^Reviews \(/).click();
    await expect(page.getByText(uniqueBody)).toBeVisible();
  });

  test("a rejected review never appears publicly", async ({ page }) => {
    const uniqueBody = `E2E rejected review ${Date.now()}`;

    await page.goto("/products/test-melt-standard");
    await page.getByText(/^Reviews \(/).click();
    await page.getByLabel("Name").fill("E2E Rejected Reviewer");
    await page.getByLabel("Email (not published)").fill("e2e-rejected@example.com");
    await page.getByLabel(/^2 stars$/).click();
    await page.getByLabel("Your review").fill(uniqueBody);
    await page.getByRole("button", { name: "Submit Review" }).click();
    await expect(page.getByText(/submitted and will appear once approved/i)).toBeVisible();

    await loginAsAdmin(page);
    await page.goto("/admin/reviews");
    const reviewCard = page.locator("div", { hasText: uniqueBody }).last();
    await reviewCard.getByRole("button", { name: "Reject" }).click();
    await expect(reviewCard.getByText("REJECTED", { exact: true })).toBeVisible({ timeout: 15_000 });

    await page.goto("/products/test-melt-standard");
    await page.getByText(/^Reviews \(/).click();
    await expect(page.getByText(uniqueBody)).not.toBeVisible();
  });
});

test.describe("Contact form", () => {
  test("a submission appears in Admin and its status can be updated", async ({ page }) => {
    const uniqueMessage = `E2E contact message ${Date.now()}`;

    await page.goto("/contact");
    await page.getByLabel("Name", { exact: true }).fill("E2E Contact");
    await page.getByLabel("Email", { exact: true }).fill("e2e-contact@example.com");
    await page.getByLabel("Message").fill(uniqueMessage);
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByText(/we'll reply as soon as we can/i)).toBeVisible();

    await loginAsAdmin(page);
    await page.goto("/admin/messages");
    await expect(page.getByText(uniqueMessage)).toBeVisible();

    const card = page.locator("div", { hasText: uniqueMessage }).last();
    await card.getByRole("button", { name: "Mark Responded" }).click();
    await expect(card.getByText("RESPONDED")).toBeVisible();
  });
});
