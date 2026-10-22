import { prisma } from "@/lib/prisma";
import { getProductKnowledge, getFaqKnowledge, getDeliveryKnowledge, getStoreKnowledge } from "@/lib/knowledge";
import { absUrl, siteUrl, SITE_NAME, LEGAL_NAME } from "@/lib/seo/site";

/**
 * The public knowledge catalogue: everything a search engine, AI assistant or
 * another agent may know about the shop, in one place. Built only from the
 * knowledge layer's public whitelists (no cost prices, supplier details,
 * customer data or internal settings can ever reach it).
 */
export async function buildCatalog() {
  const [store, products, faqs, delivery, divisions, policies] = await Promise.all([
    getStoreKnowledge(),
    getProductKnowledge(),
    getFaqKnowledge(),
    getDeliveryKnowledge(),
    prisma.division.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.policy.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  const images = await prisma.product.findMany({
    where: { id: { in: products.map((p) => p.id) } },
    select: { id: true, mainImage: true, sku: true },
  });
  const extra = new Map(images.map((i) => [i.id, i]));
  const gbp = (pence: number) => Number((pence / 100).toFixed(2));

  const productEntries = products
    .map((p) => ({
      id: p.slug,
      sku: extra.get(p.id)?.sku ?? null,
      name: p.name,
      division: p.division,
      category: p.category,
      url: `${siteUrl()}/products/${p.slug}`,
      image: absUrl(extra.get(p.id)?.mainImage) ?? null,
      price: { amount: gbp(p.currentPrice), currency: "GBP" },
      wasPrice: p.saleActive && p.salePrice ? { amount: gbp(p.price), currency: "GBP" } : null,
      available: p.available,
      madeToOrder: p.madeToOrder,
      productionDays: p.productionTimeDays,
      summary: p.shortDescription,
      description: p.description,
      material: p.material,
      care: p.careInstructions,
      safety: p.safetyWarnings,
      options: p.variants.map((v) => ({ name: v.name, size: v.size, colour: v.colour, price: gbp(v.price), available: v.available })),
    }))
    .sort((a, b) => (a.division ?? "~").localeCompare(b.division ?? "~") || a.name.localeCompare(b.name));

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    store: {
      name: SITE_NAME,
      operator: LEGAL_NAME,
      companyNumber: "16478408",
      registeredIn: "England & Wales",
      location: "Preston, Lancashire, UK",
      url: siteUrl(),
      email: store.supportEmail,
      phone: store.supportPhone,
      currency: "GBP",
      shipsTo: [...new Set(delivery.flatMap((d) => d.countries.split(/\s*,\s*/)))].filter(Boolean),
      dispatchTime: store.estimatedDispatchDays,
      deliveryTime: store.estimatedDeliveryDays,
      payment: "Card payments via Stripe Checkout",
      social: [store.instagramUrl, store.facebookUrl, store.tiktokUrl].filter(Boolean),
      howToBuy: "Choose a division, pick a product (and size where offered), add to basket and check out. Guest checkout is available.",
    },
    divisions: divisions.map((d) => ({
      id: d.slug,
      name: d.name,
      url: `${siteUrl()}/divisions/${d.slug}`,
      logo: absUrl(d.image) ?? null,
      description: d.description,
      productCount: productEntries.filter((p) => p.division === d.name).length,
    })),
    products: productEntries,
    delivery: delivery.map((d) => ({
      method: d.methodName,
      countries: d.countries,
      price: { amount: gbp(d.customerPrice), currency: "GBP" },
      freeOver: d.freeDeliveryThreshold != null ? { amount: gbp(d.freeDeliveryThreshold), currency: "GBP" } : null,
      estimatedTime: d.estimatedDays,
    })),
    returns: {
      summary:
        "Most items can be returned within 14 days of delivery for a refund under UK consumer law; return postage is paid by the customer unless the item is faulty. Personalised items such as engraved wallets are excepted from change-of-mind returns, but faulty items are always covered. See the policy for full terms.",
      policy: `${siteUrl()}/legal/returns-refunds`,
    },
    faqs: faqs.map((f) => ({ question: f.question, answer: f.answer, topic: f.category })),
    policies: policies.map((p) => ({ title: p.title, url: `${siteUrl()}/legal/${p.slug}` })),
    links: {
      shop: `${siteUrl()}/shop`,
      trackOrder: `${siteUrl()}/track-order`,
      contact: `${siteUrl()}/contact`,
      faq: `${siteUrl()}/faq`,
      llms: `${siteUrl()}/llms.txt`,
      agentCard: `${siteUrl()}/.well-known/agent-card.json`,
    },
  };
}

export type Catalog = Awaited<ReturnType<typeof buildCatalog>>;

/** A short Markdown guide for AI assistants (llmstxt.org format). */
export function catalogToLlmsTxt(c: Catalog): string {
  const L: string[] = [];
  L.push(`# ${c.store.name}`, "");
  L.push(
    `> Official online shop for the ${c.store.name} divisions across North West England (${c.divisions.map((d) => d.name.replace(/ Patriots$/, "")).join(", ")}). Each division has its own range of hoodies, t-shirts, tracksuits, mugs, keyrings, phone cases, wallets and gift sets carrying that division's crest. Run by ${c.store.operator} (company ${c.store.companyNumber}), ${c.store.location}. Prices in GBP, UK delivery, card payment via Stripe.`,
    ""
  );
  L.push("Key facts:", "");
  for (const d of c.delivery) {
    L.push(`- Delivery (${d.method}, ${d.countries}): £${d.price.amount.toFixed(2)}${d.freeOver ? `, free over £${d.freeOver.amount.toFixed(2)}` : ""}${d.estimatedTime ? `, ${d.estimatedTime}` : ""}.`);
  }
  if (c.store.dispatchTime) L.push(`- Dispatch: ${c.store.dispatchTime}. Most items are made to order.`);
  L.push(`- Returns: ${c.returns.summary}`);
  if (c.store.email) L.push(`- Contact: ${c.store.email}`);
  L.push("");
  L.push("## Divisions", "");
  for (const d of c.divisions) L.push(`- [${d.name}](${d.url}): ${d.productCount} products`);
  L.push("");
  L.push("## Shop", "");
  L.push(`- [All products](${c.links.shop})`);
  L.push(`- [Product catalogue (JSON, prices, sizes, availability)](${siteUrl()}/catalog.json)`);
  L.push(`- [Full catalogue for AI (Markdown)](${siteUrl()}/llms-full.txt)`);
  L.push(`- [Track an order](${c.links.trackOrder})`);
  L.push("");
  L.push("## Help", "");
  L.push(`- [FAQ](${c.links.faq})`);
  L.push(`- [Contact](${c.links.contact})`);
  for (const p of c.policies) L.push(`- [${p.title}](${p.url})`);
  L.push("");
  L.push("## Agents", "");
  L.push(`- [A2A agent card](${c.links.agentCard}): ask about products, prices, sizes, delivery, returns and order status.`);
  L.push("");
  return L.join("\n");
}

/** The whole catalogue as Markdown, for assistants that read text rather than JSON. */
export function catalogToLlmsFull(c: Catalog): string {
  const L: string[] = [catalogToLlmsTxt(c), "", "## Products by division", ""];
  const groups = new Map<string, Catalog["products"]>();
  for (const p of c.products) {
    const k = p.division ?? "Other";
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  for (const [division, items] of groups) {
    L.push(`### ${division}`, "");
    for (const p of items) {
      const sizes = p.options.length ? ` Options: ${p.options.map((o) => o.name).join(", ")}.` : "";
      const was = p.wasPrice ? ` (was £${p.wasPrice.amount.toFixed(2)})` : "";
      L.push(
        `- [${p.name}](${p.url}): £${p.price.amount.toFixed(2)}${was}. ${p.category ?? ""}${p.madeToOrder ? ", made to order" : ""}${p.available ? "" : ", currently unavailable"}.${sizes}${p.summary ? ` ${p.summary}` : ""}${p.material ? ` Material: ${p.material}.` : ""}`
      );
    }
    L.push("");
  }
  if (c.faqs.length) {
    L.push("## FAQ", "");
    for (const f of c.faqs) L.push(`**${f.question}**`, "", f.answer, "");
  }
  return L.join("\n");
}
