import type { Page } from "@playwright/test";

export const TEST_ADMIN = { email: "test-admin@example.com", password: "TestPassword123!" };
export const EXISTING_CUSTOMER = { email: "existing-customer@example.com", password: "ExistingPass123!" };
export const OTHER_CUSTOMER = { email: "other-customer@example.com", password: "OtherPass123!" };

export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(TEST_ADMIN.email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_ADMIN.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/admin");
}

/** /account defaults to the "Sign In" tab already active — no tab click needed. */
export async function loginAsCustomer(page: Page, email: string, password: string) {
  await page.goto("/account");
  // exact:true — the footer's newsletter field is labelled "Email address" and would
  // otherwise also match a substring search for "Email".
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  // "Sign In" also names the tab-switch button above the form — scope to the
  // form itself to reach only the actual submit button.
  await page.locator("form").getByRole("button", { name: "Sign In", exact: true }).click();
  // The action doesn't redirect — it revalidates the current page in place.
  // Wait for that to actually land before returning, otherwise a caller that
  // immediately navigates elsewhere can race ahead of the session being
  // established (the click resolves as soon as the browser processes it, not
  // once the resulting server action + re-render has finished).
  await page.getByRole("button", { name: "Sign out" }).waitFor({ state: "visible" });
}

/** Locates the form containing a specific submit button, to disambiguate from same-named fields elsewhere on the page. */
export function formWithButton(page: Page, buttonName: string) {
  return page.locator("form").filter({ has: page.getByRole("button", { name: buttonName }) });
}
