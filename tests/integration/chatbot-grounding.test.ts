import { describe, it, expect, vi, afterEach } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

const cookieStore = createMockCookieStore();

// Test 21 publishes a real FAQ — left behind, it would leak into other test
// files' fuzzy FAQ matching within the same run. Tracked and removed here.
const createdFaqIds: string[] = [];
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { prisma } = await import("@/lib/prisma");
const { createAdminSession } = await import("@/lib/auth");
const { askChatbot } = await import("@/lib/knowledge/chat");
const { createFaqFromUnansweredQuestion } = await import("@/lib/actions/admin/faqs");

afterEach(async () => {
  await prisma.faqItem.deleteMany({ where: { id: { in: createdFaqIds.splice(0) } } });
});

describe("19. an unknown question never results in a fabricated fact", () => {
  it("a nonsense/unmatched question gets the honest fallback, not an invented answer", async () => {
    const question = `Completely unmatched nonsense question ${randomUUID().slice(0, 8)} zzqx`;
    const response = await askChatbot(question);
    expect(response.resolved).toBe(false);
    expect(response.text).toContain("I don't have confirmed information about that yet");
  });

  it("asking about a fragrance that doesn't exist never invents an answer", async () => {
    const response = await askChatbot(`Do you have a Unicorn Dust ${randomUUID().slice(0, 6)} fragrance?`);
    // Either genuinely unresolved, or (if it happens to match nothing product-wise)
    // it must never claim a specific price/availability for something that doesn't exist.
    expect(response.text).not.toMatch(/£\d/);
  });
});

describe("20. an unresolved question is recorded", () => {
  it("creates an UnansweredQuestion row the first time, and increments askCount on repeats", async () => {
    const question = `How long do wax melts last exactly ${randomUUID().slice(0, 8)}`;
    await askChatbot(question);

    const recorded = await prisma.unansweredQuestion.findUnique({ where: { question: question.trim().toLowerCase() } });
    expect(recorded).not.toBeNull();
    expect(recorded!.askCount).toBe(1);

    await askChatbot(question);
    const recordedAgain = await prisma.unansweredQuestion.findUnique({ where: { question: question.trim().toLowerCase() } });
    expect(recordedAgain!.askCount).toBe(2);
  });

  it("does not store a full conversation — only the question text itself", async () => {
    const question = `Distinctive standalone question ${randomUUID().slice(0, 8)}`;
    await askChatbot(question);
    const recorded = await prisma.unansweredQuestion.findUniqueOrThrow({ where: { question: question.trim().toLowerCase() } });
    expect(Object.keys(recorded)).not.toContain("customerId");
    expect(Object.keys(recorded)).not.toContain("email");
    expect(Object.keys(recorded)).not.toContain("conversation");
  });
});

describe("21. an admin-created FAQ resolves a previously unanswered question", () => {
  it("the same question is answered from the new FAQ once published — automatically, no rebuild", async () => {
    const question = `Are your wax melts pet safe for guinea pigs ${randomUUID().slice(0, 8)}`;

    const before = await askChatbot(question);
    expect(before.resolved).toBe(false);

    const unanswered = await prisma.unansweredQuestion.findUniqueOrThrow({ where: { question: question.trim().toLowerCase() } });

    cookieStore._map.clear();
    await createAdminSession({ sub: "test-admin", email: "admin@example.com", name: "Test Admin", role: "OWNER" });

    const fd = new FormData();
    fd.set("question", question);
    fd.set("answer", "Our wax melts are for fragrance use only and are not intended for contact with any pets.");
    fd.set("category", "Safety");
    fd.set("isActive", "on");
    await createFaqFromUnansweredQuestion(unanswered.id, fd);
    const createdFaq = await prisma.faqItem.findFirstOrThrow({ where: { question } });
    createdFaqIds.push(createdFaq.id);

    const after = await askChatbot(question);
    expect(after.resolved).toBe(true);
    expect(after.text).toContain("not intended for contact with any pets");

    const resolvedRow = await prisma.unansweredQuestion.findUniqueOrThrow({ where: { id: unanswered.id } });
    expect(resolvedRow.resolvedFaqId).not.toBeNull();
  });
});
