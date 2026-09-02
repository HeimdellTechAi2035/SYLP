import { describe, it, expect, vi, afterEach } from "vitest";
import { isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

describe("isRateLimited / recordFailedAttempt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("a key with no recorded attempts is never rate-limited", () => {
    const key = `test-key-${Math.random()}`;
    expect(isRateLimited(key, 5, 60_000)).toBe(false);
  });

  it("merely checking (without recording) never counts as an attempt itself", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited(key, 5, 60_000)).toBe(false);
    }
  });

  it("blocks once recordFailedAttempt has been called `maxAttempts` times within the window", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(key, 5, 60_000)).toBe(false);
      recordFailedAttempt(key, 60_000);
    }
    expect(isRateLimited(key, 5, 60_000)).toBe(true);
  });

  it("tracks distinct keys independently (e.g. per IP+email)", () => {
    const keyA = `test-key-a-${Math.random()}`;
    const keyB = `test-key-b-${Math.random()}`;
    for (let i = 0; i < 5; i++) recordFailedAttempt(keyA, 60_000);
    expect(isRateLimited(keyA, 5, 60_000)).toBe(true);
    expect(isRateLimited(keyB, 5, 60_000)).toBe(false);
  });

  it("allows attempts again once the window has expired", () => {
    vi.useFakeTimers();
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 5; i++) recordFailedAttempt(key, 1000);
    expect(isRateLimited(key, 5, 1000)).toBe(true);

    vi.advanceTimersByTime(1001);

    expect(isRateLimited(key, 5, 1000)).toBe(false);
  });
});
