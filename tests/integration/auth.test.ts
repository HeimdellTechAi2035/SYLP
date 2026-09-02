import { describe, it, expect, vi } from "vitest";
import { createMockCookieStore } from "./helpers/mockCookies";

const cookieStore = createMockCookieStore();
let redirectedTo: string | null = null;

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
  headers: async () => new Map(), // getClientIp() -> .get() returns undefined -> "unknown"
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectedTo = url;
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { loginAdmin } = await import("@/lib/actions/admin-auth");
const { loginCustomer, registerCustomer } = await import("@/lib/actions/customer-auth");
const { getAdminSession } = await import("@/lib/auth");
const { getCustomerSession } = await import("@/lib/customer-auth");

describe("loginAdmin", () => {
  it("rejects an incorrect password without revealing whether the email exists", async () => {
    const fd = new FormData();
    fd.set("email", "test-admin@example.com");
    fd.set("password", "WrongPassword!");
    const result = await loginAdmin({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/incorrect email or password/i);
  });

  it("rejects a completely unknown email with the same generic message", async () => {
    const fd = new FormData();
    fd.set("email", "not-an-admin@example.com");
    fd.set("password", "Whatever123!");
    const result = await loginAdmin({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/incorrect email or password/i);
  });

  it("logs in successfully with correct credentials and establishes a verifiable session", async () => {
    cookieStore._map.clear();
    redirectedTo = null;
    const fd = new FormData();
    fd.set("email", "test-admin@example.com");
    fd.set("password", "TestPassword123!");

    await expect(loginAdmin({ status: "idle" }, fd)).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectedTo).toBe("/admin");

    const session = await getAdminSession();
    expect(session?.email).toBe("test-admin@example.com");
    expect(session?.role).toBe("OWNER");
  });

  it("blocks further attempts after 5 failures for the same email, within the rate-limit window", async () => {
    const email = "rate-limit-admin@example.com";
    for (let i = 0; i < 5; i++) {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", "wrong");
      const result = await loginAdmin({ status: "idle" }, fd);
      expect(result.status).toBe("error");
    }

    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", "wrong");
    const blocked = await loginAdmin({ status: "idle" }, fd);
    expect(blocked.message).toMatch(/too many attempts/i);
  });

  it("does NOT lock out a legitimate admin who logs in successfully several times in a row", async () => {
    // Regression test for a real bug found during Stage 3: the rate limiter
    // was consulted (and incremented) on EVERY login attempt regardless of
    // outcome, so a real admin logging in repeatedly with the CORRECT
    // password — across tabs, page refreshes, or just normal daily use —
    // could get locked out of their own account for 5 minutes.
    for (let i = 0; i < 6; i++) {
      cookieStore._map.clear();
      const fd = new FormData();
      fd.set("email", "test-admin@example.com");
      fd.set("password", "TestPassword123!");
      await expect(loginAdmin({ status: "idle" }, fd)).rejects.toThrow("NEXT_REDIRECT");
    }
  });
});

describe("customer auth", () => {
  it("rejects login with an incorrect password", async () => {
    const fd = new FormData();
    fd.set("email", "existing-customer@example.com");
    fd.set("password", "WrongPassword!");
    const result = await loginCustomer({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });

  it("logs in successfully with correct credentials and establishes a verifiable session", async () => {
    cookieStore._map.clear();
    const fd = new FormData();
    fd.set("email", "existing-customer@example.com");
    fd.set("password", "ExistingPass123!");
    const result = await loginCustomer({ status: "idle" }, fd);
    expect(result.status).toBe("idle"); // no error => success

    const session = await getCustomerSession();
    expect(session?.email).toBe("existing-customer@example.com");
  });

  it("prevents registering a second account on an email that already has a password", async () => {
    const fd = new FormData();
    fd.set("firstName", "Dup");
    fd.set("lastName", "Licate");
    fd.set("email", "existing-customer@example.com");
    fd.set("password", "SomeNewPassword1!");
    const result = await registerCustomer({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/already exists/i);
  });

  it("rejects registration with a password shorter than 8 characters", async () => {
    const fd = new FormData();
    fd.set("firstName", "Short");
    fd.set("lastName", "Pass");
    fd.set("email", `short-pass-${Date.now()}@example.com`);
    fd.set("password", "abc123");
    const result = await registerCustomer({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });
});
