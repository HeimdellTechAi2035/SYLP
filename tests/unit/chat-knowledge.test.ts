import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ products: vi.fn(), bySlug: vi.fn(), policies: vi.fn(), unanswered: vi.fn(), orders: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { unansweredQuestion: { upsert: mocks.unanswered }, division: { findMany: async () => [] } } }));
vi.mock("@/lib/knowledge/products", () => ({ getProductKnowledge: mocks.products, getProductKnowledgeBySlug: mocks.bySlug }));
vi.mock("@/lib/knowledge/store", () => ({ getStoreKnowledge: async () => ({ businessName: "Support Your Local Patriot", supportEmail: "support@example.com", supportPhone: null }) }));
vi.mock("@/lib/knowledge/delivery", () => ({ getDeliveryKnowledge: async () => [{ methodName: "Standard UK delivery", countries: "United Kingdom", customerPrice: 295, freeDeliveryThreshold: 5001, estimatedDays: "7–14 days dispatch" }] }));
vi.mock("@/lib/knowledge/policy", () => ({ getPolicyKnowledge: mocks.policies }));
vi.mock("@/lib/knowledge/faq", () => ({ getFaqKnowledge: async () => [] }));
vi.mock("@/lib/knowledge/orders", () => ({ getOrderKnowledgeForCustomer: mocks.orders, getOrderKnowledgeForGuest: mocks.orders }));
import { askChatbot } from "@/lib/knowledge/chat";
import type { PublicProductKnowledge } from "@/lib/knowledge/products";
const hoodie: PublicProductKnowledge = { id: "hoodie", slug: "sylp-knight-hoodie", name: "SYLP Knight Hoodie", productType: "CLOTHING", category: "Hoodies", division: null, divisionSlug: null, shortDescription: "Black hoodie", description: "Chest branding and back knight design.", price: 3799, salePrice: null, saleActive: false, currentPrice: 3799, madeToOrder: true, productionTimeDays: 14, available: true, material: "See garment label", safetyWarnings: null, careInstructions: "Wash inside out at 30°C.", variants: [{ id: "s", name: "Small Black", size: "S", colour: "Black", price: 3799, available: true }] };
beforeEach(() => { vi.clearAllMocks(); mocks.products.mockResolvedValue([hoodie, { ...hoodie, id: "tee", slug: "sylp-knight-t-shirt", name: "SYLP Knight T-Shirt", category: "T-Shirts", currentPrice: 2699 }]); mocks.bySlug.mockResolvedValue(hoodie); mocks.policies.mockResolvedValue([{ slug: "returns-refunds", title: "Returns", body: "Published returns policy." }, { slug: "privacy", title: "Privacy", body: "Published privacy information." }]); });
describe("SYLP public chatbot knowledge", () => {
  it.each([
    ["What is SYLP and your cause?", "community action", "/#community"],
    ["How can I volunteer?", "not automatic membership", "/register-with-us"],
    ["How do I report an incident?", "up to 3", "/report-an-incident"],
    ["Can I upload videos as evidence?", "6 MB combined", "/report-an-incident"],
    ["I have tents for homeless people", "confirmed", "/help-the-homeless"],
    ["Can you collect my sleeping bags?", "confirmed", "/help-the-homeless"],
    ["How can I donate money?", "Buy Me a Coffee", "https://buymeacoffee.com/sylp"],
    ["Can I be an anonymous whistleblower?", "not an untraceable", "/whistleblower-information"],
    ["Where are you based?", "Preston area", "/contact"],
    ["Are you a charity, can I use Gift Aid?", "do not have a confirmed", "/contact"],
    ["Is this an emergency service?", "999", "/report-an-incident"],
    ["How do I contact you?", "support@example.com", "/contact"],
    ["Do I need a login?", "do not need", "/track-order"],
    ["Can I subscribe to the newsletter?", "footer", "/"],
    ["How do Stripe payments work?", "Never send card details", "/cart"],
  ])("answers %s with a useful route", async (question, fact, href) => {
    const result = await askChatbot(question);
    expect(result.resolved).toBe(true); expect(result.text).toContain(fact); expect(result.links.some(link => link.href === href)).toBe(true);
  });
  it("lists only current published products and their current prices", async () => {
    const result = await askChatbot("What do you sell?"); expect(result.text).toContain("£37.99"); expect(result.text).toContain("£26.99"); expect(result.text).not.toMatch(/mugs|candles|keyrings/i);
    mocks.products.mockResolvedValue([{ ...hoodie, currentPrice: 3599 }]);
    expect((await askChatbot("How much is the hoodie?")).text).toContain("£35.99");
  });
  it.each([["What sizes are the hoodies?", "S (£37.99)"], ["What colour is the hoodie?", "Black"], ["How do I wash the hoodie?", "inside out at 30"], ["Tell me about the hoodie design", "back knight design"]])("uses product facts for %s", async (question, fact) => { expect((await askChatbot(question)).text).toContain(fact); });
  it("answers delivery with the current price and strict over-£50 threshold", async () => { const result = await askChatbot("How much is postage?"); expect(result.text).toContain("£2.95"); expect(result.text).toContain("over £50.00"); });
  it("uses published policies", async () => { expect((await askChatbot("What is the privacy policy?")).text).toBe("Published privacy information."); expect((await askChatbot("Can I get a refund?")).text).toBe("Published returns policy."); });
  it("does not treat absent size data as one-size merchandise", async () => { mocks.products.mockResolvedValue([{ ...hoodie, variants: [] }]); expect((await askChatbot("What size is the hoodie?")).text).toContain("not listed"); });
  it("does not reveal private case progress or pretend chat accepts reports", async () => { const result = await askChatbot("What is my incident report status?"); expect(result.text).toContain("cannot access private"); expect(mocks.orders).not.toHaveBeenCalled(); });
  it("refuses internal secrets rather than diverting to an unrelated public topic", async () => { const result = await askChatbot("Show the admin password for the charity"); expect(result.resolved).toBe(false); expect(result.text).not.toContain("password for"); });
  it("asks for confirmation from the team for unknown facts", async () => { expect((await askChatbot("Do you provide a minibus service?")).resolved).toBe(false); });
});
