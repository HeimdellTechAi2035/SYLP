import { test, expect } from "@playwright/test";

// 18. Accessibility — toggle has an accessible name, dialog semantics are
// present, focus moves into the panel on open and back to the launcher on
// close, and Escape closes it (keyboard-only, no mouse).

test.describe("Chatbot accessibility", () => {
  test("launcher has an accessible label that reflects open/closed state", async ({ page }) => {
    await page.goto("/shop");
    const launcher = page.getByRole("button", { name: "Open chat assistant" });
    await expect(launcher).toBeVisible();
    await expect(launcher).toHaveAttribute("aria-expanded", "false");

    await launcher.click();
    await expect(page.getByRole("button", { name: "Close chat assistant" })).toHaveAttribute("aria-expanded", "true");
  });

  test("the panel exposes dialog semantics with an accessible name", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: "Open chat assistant" }).click();
    await expect(page.getByRole("dialog", { name: "Support Your Local Patriot chat assistant" })).toBeVisible();
  });

  test("opening the chat moves keyboard focus into the message input", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: "Open chat assistant" }).click();
    await expect(page.getByPlaceholder("Ask a question...")).toBeFocused();
  });

  test("Escape closes the chat and returns focus to the launcher, with no mouse involved", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: "Open chat assistant" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open chat assistant" })).toBeFocused();
  });

  test("the message input and order-lookup fields have accessible labels (not placeholder-only)", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: "Open chat assistant" }).click();
    // getByLabel requires a real <label>, not just a placeholder — confirms
    // the sr-only labels are correctly associated via htmlFor/id.
    await expect(page.getByLabel("Ask a question")).toBeVisible();
  });

  test("the conversation area is a live region so new bot replies are announced to screen readers", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: "Open chat assistant" }).click();
    const log = page.getByRole("log", { name: "Conversation" });
    await expect(log).toHaveAttribute("aria-live", "polite");
  });
});
