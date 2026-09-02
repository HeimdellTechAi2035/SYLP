import { describe, it, expect, afterEach } from "vitest";
import { randomUUID } from "crypto";

const { prisma } = await import("@/lib/prisma");
const { getFaqKnowledge } = await import("@/lib/knowledge/faq");

// Left-behind FAQ rows would leak into other test files sharing this
// database within the same run — e.g. the chatbot's fuzzy FAQ matching could
// then "confidently" match an otherwise-unrelated test's leftover question.
const createdFaqIds: string[] = [];
afterEach(async () => {
  await prisma.faqItem.deleteMany({ where: { id: { in: createdFaqIds.splice(0) } } });
});

async function disposableFaq(overrides: Record<string, unknown> = {}) {
  const id = randomUUID().slice(0, 8);
  const faq = await prisma.faqItem.create({
    data: {
      question: `Test question ${id}?`,
      answer: `Test answer ${id}.`,
      category: "General",
      isActive: true,
      ...overrides,
    },
  });
  createdFaqIds.push(faq.id);
  return faq;
}

describe("7. a published FAQ can be answered", () => {
  it("appears in getFaqKnowledge", async () => {
    const faq = await disposableFaq({ question: "How long do wax melts last?" });
    const knowledge = await getFaqKnowledge();
    expect(knowledge.find((f) => f.id === faq.id)?.question).toBe("How long do wax melts last?");
  });
});

describe("8. an updated FAQ is immediately reflected", () => {
  it("the new answer text is returned on the next call, without any rebuild", async () => {
    const faq = await disposableFaq({ answer: "Old answer." });
    expect((await getFaqKnowledge()).find((f) => f.id === faq.id)?.answer).toBe("Old answer.");

    await prisma.faqItem.update({ where: { id: faq.id }, data: { answer: "New, corrected answer." } });

    expect((await getFaqKnowledge()).find((f) => f.id === faq.id)?.answer).toBe("New, corrected answer.");
  });
});

describe("9. an unpublished FAQ is not used", () => {
  it("isActive: false excludes it from knowledge", async () => {
    const faq = await disposableFaq({ isActive: false });
    const knowledge = await getFaqKnowledge();
    expect(knowledge.find((f) => f.id === faq.id)).toBeUndefined();
  });

  it("an FAQ published then later unpublished disappears immediately", async () => {
    const faq = await disposableFaq({ isActive: true });
    expect((await getFaqKnowledge()).find((f) => f.id === faq.id)).toBeDefined();

    await prisma.faqItem.update({ where: { id: faq.id }, data: { isActive: false } });

    expect((await getFaqKnowledge()).find((f) => f.id === faq.id)).toBeUndefined();
  });
});

describe("10. a brand new FAQ becomes available without any code rebuild", () => {
  it("a freshly created FAQ is returned by the very next getFaqKnowledge() call", async () => {
    const question = `Brand new question ${randomUUID().slice(0, 8)}?`;
    const before = await getFaqKnowledge();
    expect(before.find((f) => f.question === question)).toBeUndefined();

    await disposableFaq({ question });

    const after = await getFaqKnowledge();
    expect(after.find((f) => f.question === question)).toBeDefined();
  });
});
