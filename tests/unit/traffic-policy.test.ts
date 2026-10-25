import { describe, expect, it } from "vitest";
import { trackablePath, londonStartOfDay } from "@/lib/analytics/traffic-policy";
describe("anonymous traffic boundaries", () => {
  it("counts public pages without accepting query strings or personal paths", () => {
    for (const path of ["/", "/shop", "/products/knight-hoodie"]) expect(trackablePath(path)).toBe(true);
    for (const path of ["/admin", "/admin/messages", "/api/traffic", "/account/profile", "/checkout", "/orders/token", "/track-order", "/report-an-incident", "/whistleblower-information", "/register-with-us", "/help-the-homeless", "/community/private", "/?email=person@example.com", "https://example.com", null]) expect(trackablePath(path)).toBe(false);
  });
  it("uses UK midnight, including summer time and the October clock change", () => {
    expect(londonStartOfDay(new Date("2026-07-12T14:00:00Z")).toISOString()).toBe("2026-07-11T23:00:00.000Z");
    expect(londonStartOfDay(new Date("2026-10-25T15:00:00Z")).toISOString()).toBe("2026-10-24T23:00:00.000Z");
    expect(londonStartOfDay(new Date("2026-12-12T14:00:00Z")).toISOString()).toBe("2026-12-12T00:00:00.000Z");
  });
});
