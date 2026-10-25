import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ session: null as null | { sub: string; role: string; mustChangePassword: boolean }, find: vi.fn(), remove: vi.fn(), deleteMany: vi.fn(), audit: vi.fn(), subscriber: vi.fn(), reviewFind: vi.fn(), reviewDelete: vi.fn(), transaction: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdminSession: async () => { if (!mocks.session) throw new Error("unauthorised"); return mocks.session; } }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not found"); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/community/evidence", () => ({ removeEvidence: mocks.remove }));
vi.mock("@/lib/prisma", () => ({ prisma: { contactMessage: { findUnique: mocks.find }, review: { findUnique: mocks.reviewFind }, $transaction: mocks.transaction } }));
import { deleteMessage, clearHandledMessages, deleteSubscriber, deleteReview } from "@/lib/actions/admin/cleanup";
const record = { version: 1, reference: "SYLP-TEST", data: {}, files: [{ key: "test.bin", type: "image/jpeg", extension: "jpg", size: 4 }], delivery: "SENT" };
beforeEach(() => {
  vi.clearAllMocks(); mocks.session = { sub: "owner", role: "OWNER", mustChangePassword: false };
  mocks.find.mockResolvedValue({ id: "message", category: "Product question", message: "Hello" });
  mocks.deleteMany.mockResolvedValue({ count: 1 });
  mocks.transaction.mockImplementation(fn => fn({ contactMessage: { deleteMany: mocks.deleteMany }, auditLog: { create: mocks.audit }, newsletterSubscriber: { deleteMany: mocks.subscriber }, review: { deleteMany: mocks.reviewDelete } }));
});
describe("dashboard deletion permissions", () => {
  it("blocks unauthenticated users and password-change sessions before deletion", async () => {
    mocks.session = null; await expect(deleteMessage("message")).rejects.toThrow();
    mocks.session = { sub: "owner", role: "OWNER", mustChangePassword: true }; await expect(clearHandledMessages()).rejects.toThrow();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("prevents staff deleting private submissions or subscribers", async () => {
    mocks.session!.role = "STAFF"; mocks.find.mockResolvedValue({ category: "Community: incident", message: JSON.stringify(record) });
    await expect(deleteMessage("message")).rejects.toThrow("not found"); await expect(deleteSubscriber("subscriber")).rejects.toThrow("not found"); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("deletes an owner submission and its evidence, but only after successful database deletion", async () => {
    mocks.find.mockResolvedValue({ category: "Community: incident", message: JSON.stringify(record) });
    await deleteMessage("message"); expect(mocks.remove).toHaveBeenCalledWith(record.files); expect(mocks.audit).toHaveBeenCalled();
    mocks.remove.mockClear(); mocks.deleteMany.mockResolvedValue({ count: 0 }); await deleteMessage("message"); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("does not delete an incident while forwarding is in progress", async () => {
    mocks.find.mockResolvedValue({ category: "Community: incident", message: JSON.stringify({ ...record, delivery: "PENDING" }) });
    await expect(deleteMessage("message")).rejects.toThrow(); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("bulk cleanup only removes responded contact messages, not unread or community records", async () => {
    await clearHandledMessages(); expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { status: "RESPONDED", NOT: { category: { startsWith: "Community: " } } } });
  });
  it("supports individual contact, newsletter and review deletion with audit records", async () => {
    await deleteMessage("message"); await deleteSubscriber("subscriber");
    mocks.reviewFind.mockResolvedValue({ product: { slug: "hoodie" } }); await deleteReview("review");
    expect(mocks.subscriber).toHaveBeenCalledWith({ where: { id: "subscriber" } }); expect(mocks.reviewDelete).toHaveBeenCalledWith({ where: { id: "review" } }); expect(mocks.audit).toHaveBeenCalledTimes(3);
  });
});
