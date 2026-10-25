import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ transaction: vi.fn(), visit: vi.fn(), view: vi.fn(), limited: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: mocks.transaction } }));
vi.mock("@/lib/auth", () => ({ ADMIN_SESSION_COOKIE: "hbm_admin_session" }));
vi.mock("@/lib/rate-limit", () => ({ clientIpFrom: () => "192.0.2.1", isRateLimited: mocks.limited, recordFailedAttempt: vi.fn() }));
import { POST } from "@/app/api/traffic/route";
const event = { visitId: "ea31cece-c9ac-4f39-a393-2846ff8fd596", eventId: "4d260fbc-774f-462a-b194-f382b93422c0", path: "/shop", consent: true };
function request(body: unknown = event, headers: Record<string,string> = {}) {
  return new NextRequest("https://example.com/api/traffic", { method: "POST", headers: { origin: "https://example.com", "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
}
beforeEach(() => { vi.clearAllMocks(); process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"; mocks.limited.mockReturnValue(false); mocks.transaction.mockImplementation(fn => fn({ trafficVisit: { upsert: mocks.visit }, trafficPageView: { create: mocks.view } })); });
describe("traffic ingestion", () => {
  it("requires analytics consent and never records private page paths", async () => {
    expect((await POST(request({ ...event, consent: false }))).status).toBe(400);
    expect((await POST(request({ ...event, path: "/report-an-incident" }))).status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("rejects cross-site writes and rate limited traffic", async () => {
    expect((await POST(request(event, { origin: "https://attacker.example" }))).status).toBe(403);
    mocks.limited.mockReturnValue(true); expect((await POST(request())).status).toBe(429); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("excludes admin browsers and known crawlers", async () => {
    expect((await POST(request(event, { cookie: "hbm_admin_session=test" }))).status).toBe(204);
    expect((await POST(request(event, { "user-agent": "Googlebot" }))).status).toBe(204);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("stores only random identifiers and a public path, never IP or request headers", async () => {
    expect((await POST(request())).status).toBe(204);
    expect(mocks.view).toHaveBeenCalledWith({ data: { id: event.eventId, visitId: event.visitId, path: "/shop" } });
    expect(mocks.visit).toHaveBeenCalledWith(expect.objectContaining({ create: { id: event.visitId } }));
  });
  it("deduplicates repeated events and fails safely if the database is unavailable", async () => {
    mocks.transaction.mockRejectedValueOnce({ code: "P2002" }); expect((await POST(request())).status).toBe(204);
    mocks.transaction.mockRejectedValueOnce(new Error("unavailable")); expect((await POST(request())).status).toBe(503);
  });
});
