import { headers } from "next/headers";

// Simple in-memory sliding-window limiter. Fine for a single-instance deployment;
// swap for a shared store (e.g. Upstash Redis) before scaling to multiple instances,
// since this map is per-process and resets on restart/deploy.
const attempts = new Map<string, number[]>();

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return clientIpFrom(headerList);
}

/**
 * Read-only check — does NOT record anything. Call this before attempting
 * authentication; only call recordFailedAttempt() afterwards if it actually
 * failed. Counting successful logins here too would let a legitimate user
 * lock themselves out just by logging in correctly several times in a row.
 */
export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const windowStart = Date.now() - windowMs;
  const recent = (attempts.get(key) ?? []).filter((t) => t > windowStart);
  attempts.set(key, recent);
  return recent.length >= maxAttempts;
}

/** Records one failed attempt against the sliding window for this key. */
export function recordFailedAttempt(key: string, windowMs: number): void {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (attempts.get(key) ?? []).filter((t) => t > windowStart);
  recent.push(now);
  attempts.set(key, recent);
}

/**
 * The visitor's IP as seen by our own reverse proxy (nginx), which appends it
 * as the LAST entry of X-Forwarded-For. Earlier entries can be typed in by
 * the visitor themselves, so trusting the first one would let anyone dodge
 * the login rate limit by sending a fake header.
 */
export function clientIpFrom(h: { get(name: string): string | null }): string {
  const chain = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return chain[chain.length - 1] || h.get("x-real-ip") || "unknown";
}
