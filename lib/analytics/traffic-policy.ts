import { isCommunityPath } from "@/lib/community/config";

export function trackablePath(value: unknown): value is string {
  return typeof value === "string" && value.length <= 200 && /^\/[a-zA-Z0-9/_-]*$/.test(value) &&
    !/^\/(admin|api|account|checkout|orders?|track-order)(\/|$)/.test(value) && !isCommunityPath(value);
}

export function londonStartOfDay(now = new Date()): Date {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const midnight = new Date(`${date}T00:00:00Z`);
  const zone = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "longOffset" }).formatToParts(midnight).find(p => p.type === "timeZoneName")?.value ?? "GMT";
  const offset = /GMT([+-])(\d{2}):(\d{2})/.exec(zone);
  const minutes = offset ? (Number(offset[2]) * 60 + Number(offset[3])) * (offset[1] === "+" ? 1 : -1) : 0;
  return new Date(midnight.getTime() - minutes * 60_000);
}
