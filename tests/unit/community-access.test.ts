import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ session: null as null | { role: string; mustChangePassword: boolean }, find: vi.fn(), read: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAdminSession: async () => state.session, requireAdminSession: async () => state.session }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not found"); } }));
vi.mock("@/lib/prisma", () => ({ prisma: { contactMessage: { findFirst: state.find } } }));
vi.mock("@/lib/community/evidence", () => ({ readEvidence: state.read }));
import { GET } from "@/app/api/admin/community/evidence/[id]/[key]/route";
import { requireCommunityOwner } from "@/lib/community/owner";
beforeEach(() => { state.session = null; state.find.mockReset(); state.read.mockReset(); });
const params = { params: Promise.resolve({ id: "case", key: "file.bin" }) };
describe("private community records and evidence", () => {
  it("does not reveal files or query records to an unauthenticated visitor", async () => { expect((await GET(new Request("https://example.com"),params)).status).toBe(404); expect(state.find).not.toHaveBeenCalled(); });
  it("does not let ordinary store staff access evidence or the inbox", async () => { state.session = { role: "STAFF", mustChangePassword: false }; expect((await GET(new Request("https://example.com"),params)).status).toBe(404); await expect(requireCommunityOwner()).rejects.toThrow("not found"); expect(state.find).not.toHaveBeenCalled(); });
  it("blocks owner sessions that still require a password change", async () => { state.session = { role: "OWNER", mustChangePassword: true }; expect((await GET(new Request("https://example.com"),params)).status).toBe(404); });
  it("serves owner evidence as a non-cacheable download", async () => {
    state.session = { role: "OWNER", mustChangePassword: false };
    state.find.mockResolvedValue({ message: JSON.stringify({ version: 1, reference: "SYLP-TEST", data: {}, files: [{ key: "file.bin", type: "image/jpeg", extension: "jpg", size: 3 }] }) });
    state.read.mockResolvedValue(Buffer.from([1,2,3]));
    const response = await GET(new Request("https://example.com"),params);
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toContain("no-store"); expect(response.headers.get("content-disposition")).toContain("attachment"); expect(response.headers.get("content-security-policy")).toBe("sandbox");
  });
});
