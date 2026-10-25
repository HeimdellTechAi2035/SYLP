import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ owner: vi.fn(), count: vi.fn(), groups: vi.fn(), find: vi.fn() }));
vi.mock("@/lib/community/owner", () => ({ requireCommunityOwner: mocks.owner }));
vi.mock("@/lib/actions/admin/community", () => ({ retryIncident: vi.fn(), setCommunityStatus: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { contactMessage: { count: mocks.count, groupBy: mocks.groups, findMany: mocks.find } } }));
import CommunityInbox from "@/components/admin/CommunityInbox";
import { communityInboxes } from "@/lib/community/inboxes";
beforeEach(() => { vi.clearAllMocks(); mocks.owner.mockResolvedValue({ role: "OWNER" }); mocks.count.mockResolvedValue(101); mocks.groups.mockResolvedValue([]); mocks.find.mockResolvedValue([]); });
describe("separate private form inboxes", () => {
  it.each(Object.keys(communityInboxes) as (keyof typeof communityInboxes)[])("only queries %s submissions", async kind => {
    await CommunityInbox({ kind, searchParams: Promise.resolve({ status: "NEW", page: "2" }) });
    expect(mocks.find).toHaveBeenCalledWith(expect.objectContaining({ where: { category: { equals: `Community: ${kind}` }, status: "NEW" }, skip: 50, take: 50 }));
  });
  it("does not query submission data before owner access is established", async () => {
    mocks.owner.mockRejectedValue(new Error("not found"));
    await expect(CommunityInbox({ kind: "whistleblower", searchParams: Promise.resolve({}) })).rejects.toThrow("not found");
    expect(mocks.find).not.toHaveBeenCalled(); expect(mocks.count).not.toHaveBeenCalled(); expect(mocks.groups).not.toHaveBeenCalled();
  });
  it("ignores unknown statuses and bounds a page to the available records", async () => {
    await CommunityInbox({ kind: "register", searchParams: Promise.resolve({ status: "something else", page: "999999999" }) });
    expect(mocks.find).toHaveBeenCalledWith(expect.objectContaining({ where: { category: { equals: "Community: register" } }, skip: 100 }));
  });
});
