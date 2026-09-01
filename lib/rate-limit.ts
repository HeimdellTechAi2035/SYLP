import { headers } from "next/headers";

// Simple in-memory sliding-window limiter. Fine for a single-instance deployment;
// swap for a shared store (e.g. Upstash Redis) before scaling to multiple instances,
// since this map is per-process and resets on restart/deploy.
const attempts = new Map<string, number[]>();

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0].trim() || headerList.get("x-real-ip") || "unknown";
}

/** Returns true if the action should be BLOCKED (too many recent attempts). */
export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (attempts.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= maxAttempts) {
    attempts.set(key, recent);
    return true;
  }

  recent.push(now);
  attempts.set(key, recent);
  return false;
}
