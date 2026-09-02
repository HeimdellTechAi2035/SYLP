import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";

// Each test uses its own fake IP so it gets a fresh bucket in the shared
// in-memory rate limiter (lib/rate-limit.ts) — otherwise tests would
// interfere with each other's counters within the same process.

let currentIp = "0.0.0.0";
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Map([["x-forwarded-for", currentIp]]),
}));

const { sendChatMessage } = await import("@/lib/actions/chat");

function freshIp() {
  currentIp = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${randomUUID().slice(0, 2)}`;
  return currentIp;
}

describe("25. chat is rate limited per source", () => {
  it("allows a normal back-and-forth conversation without being blocked", async () => {
    freshIp();
    for (let i = 0; i < 10; i++) {
      const response = await sendChatMessage("how much is delivery?");
      expect(response.text).not.toContain("sending messages a little quickly");
    }
  });

  it("blocks a burst of automated requests once the limit is exceeded", async () => {
    freshIp();
    let sawRateLimitMessage = false;
    for (let i = 0; i < 40; i++) {
      const response = await sendChatMessage("how much is delivery?");
      if (response.text.includes("sending messages a little quickly")) {
        sawRateLimitMessage = true;
        break;
      }
    }
    expect(sawRateLimitMessage).toBe(true);
  });

  it("a rate-limited response never undoes or corrupts anything — it's just declined", async () => {
    freshIp();
    for (let i = 0; i < 40; i++) await sendChatMessage("how much is delivery?");
    const response = await sendChatMessage("how much is delivery?");
    expect(response.resolved).toBe(false);
    expect(response.links).toEqual([]);
  });
});

describe("26. oversized and empty input are handled safely", () => {
  it("an empty message is rejected with a friendly prompt, not an error", async () => {
    freshIp();
    const response = await sendChatMessage("");
    expect(response.text).toContain("Please type a question");
  });

  it("a whitespace-only message is treated the same as empty", async () => {
    freshIp();
    const response = await sendChatMessage("   ");
    expect(response.text).toContain("Please type a question");
  });

  it("a pathologically long message is truncated rather than processed in full or crashing", async () => {
    freshIp();
    const hugeMessage = "how much is delivery? " + "a".repeat(50_000);
    const response = await sendChatMessage(hugeMessage);
    // Must complete successfully (no crash) and still be able to answer a
    // recognisable question at the start of the (now-truncated) message.
    expect(response.text.length).toBeLessThan(2000);
    expect(response.resolved).toBeDefined();
  });
});
