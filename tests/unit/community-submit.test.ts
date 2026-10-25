import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), save: vi.fn(), remove: vi.fn(), forward: vi.fn(), limited: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { contactMessage: { create: mocks.create, update: mocks.update } } }));
vi.mock("@/lib/community/evidence", () => ({ saveEvidence: mocks.save, removeEvidence: mocks.remove }));
vi.mock("@/lib/community/forward-incident", () => ({ forwardIncident: mocks.forward }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: async () => "192.0.2.123", isRateLimited: mocks.limited, recordFailedAttempt: vi.fn() }));
import { submitCommunity } from "@/lib/actions/community";

function form(kind: string) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ kind, name: "Test", email: "test@example.com", message: "This is a clearly marked integration test, not a real incident.", area: "Preston", consent: "yes", interest: "Volunteering", address: "Test street", town: "Preston", postcode: "PR1 1AA", incidentCategory: "other", fulfilment: "collection" })) data.set(key,value);
  return data;
}
beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({}); mocks.update.mockResolvedValue({}); mocks.forward.mockResolvedValue(undefined); mocks.limited.mockReturnValue(false); mocks.save.mockResolvedValue([]); });
describe("community submission persistence and delivery", () => {
  it("stores anonymous information without identifying contact fields or visitor IP", async () => {
    const data = form("whistleblower"); data.set("anonymous","yes");
    expect((await submitCommunity({status:"idle"},data)).status).toBe("success");
    const saved = mocks.create.mock.calls[0][0].data;
    expect(saved.email).toBe(""); expect(JSON.parse(saved.message).data.name).toBe("");
    expect(JSON.stringify(saved)).not.toContain("192.0.2.123"); expect(mocks.forward).not.toHaveBeenCalled();
  });
  it("saves an incident before forwarding it once and records confirmed delivery", async () => {
    const result = await submitCommunity({status:"idle"},form("incident"));
    expect(result.status).toBe("success"); expect(mocks.forward).toHaveBeenCalledTimes(1);
    expect(mocks.create.mock.invocationCallOrder[0]).toBeLessThan(mocks.forward.mock.invocationCallOrder[0]);
    expect(JSON.parse(mocks.update.mock.calls[0][0].data.message).delivery).toBe("SENT");
  });
  it("preserves the report and accurately reports unconfirmed remote delivery", async () => {
    mocks.forward.mockRejectedValue(new Error("network failure"));
    const result = await submitCommunity({status:"idle"},form("incident"));
    expect(result.message).toContain("could not be confirmed");
    expect(JSON.parse(mocks.update.mock.calls[0][0].data.message).delivery).toBe("UNCONFIRMED");
  });
  it("does not forward an incident if the local save fails", async () => {
    mocks.create.mockRejectedValue(new Error("database unavailable"));
    expect((await submitCommunity({status:"idle"},form("incident"))).status).toBe("error");
    expect(mocks.remove).toHaveBeenCalled(); expect(mocks.forward).not.toHaveBeenCalled();
  });
  it("does not store missing consent or a forged submission kind", async () => {
    const data=form("incident"); data.delete("consent"); expect((await submitCommunity({status:"idle"},data)).status).toBe("error");
    expect((await submitCommunity({status:"idle"},form("ADMIN"))).status).toBe("error"); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("blocks rate-limited submissions before database writes", async () => {
    mocks.limited.mockReturnValue(true); expect((await submitCommunity({status:"idle"},form("register"))).status).toBe("error"); expect(mocks.create).not.toHaveBeenCalled();
  });
});
