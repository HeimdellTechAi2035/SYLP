import { test, expect } from "@playwright/test";

const SENSITIVE_ENV_NAMES = [
  "DATABASE_URL",
  "ADMIN_PASSWORD",
  "SESSION_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

// A same-origin page fetch (not a bare string search of node_modules/build
// tooling output) — this is what an actual visitor's browser would receive.
async function fetchBodyText(page: import("@playwright/test").Page, path: string) {
  const response = await page.request.get(path);
  return { status: response.status(), text: await response.text().catch(() => "") };
}

test.describe("No secret/connection-string leakage to the browser", () => {
  test("homepage HTML never contains any sensitive env var name or the dev.db path", async ({ page }) => {
    const { text } = await fetchBodyText(page, "/");
    for (const name of SENSITIVE_ENV_NAMES) {
      expect(text).not.toContain(name);
    }
    expect(text).not.toContain("file:./dev.db");
    expect(text).not.toContain("dev.db");
  });

  test("admin login page HTML never contains any sensitive env var name", async ({ page }) => {
    const { text } = await fetchBodyText(page, "/admin/login");
    for (const name of SENSITIVE_ENV_NAMES) {
      expect(text).not.toContain(name);
    }
  });

  test("the Stripe webhook endpoint's error response never echoes the webhook secret or a raw exception message", async ({ page }) => {
    const response = await page.request.post("/api/stripe/webhook", {
      headers: { "stripe-signature": "t=1,v1=not-a-real-signature" },
      data: JSON.stringify({ type: "checkout.session.completed" }),
    });
    expect(response.status()).toBe(400);
    const text = await response.text();
    expect(text).not.toContain("STRIPE_WEBHOOK_SECRET");
    expect(text).not.toContain("whsec_");
    // Generic rejection only — no echoed SDK exception detail.
    expect(text).toContain("Invalid signature");
  });

  test("the Stripe webhook endpoint only accepts POST", async ({ page }) => {
    const response = await page.request.get("/api/stripe/webhook");
    expect(response.status()).toBe(405);
  });
});

test.describe("dev.db is not reachable through any public HTTP path", () => {
  for (const path of ["/dev.db", "/prisma/dev.db", "/prisma/test.db", "/test.db", "/.env", "/.env.test"]) {
    test(`GET ${path} returns 404, not the file`, async ({ page }) => {
      const response = await page.request.get(path);
      expect(response.status()).toBe(404);
    });
  }
});
