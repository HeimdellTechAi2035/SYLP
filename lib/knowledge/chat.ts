import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import { getProductKnowledge, getProductKnowledgeBySlug, type PublicProductKnowledge } from "@/lib/knowledge/products";
import { getFaqKnowledge } from "@/lib/knowledge/faq";
import { getDeliveryKnowledge } from "@/lib/knowledge/delivery";
import { getPolicyKnowledge } from "@/lib/knowledge/policy";
import { getStoreKnowledge, type StoreKnowledge } from "@/lib/knowledge/store";
import { getOrderKnowledgeForCustomer, getOrderKnowledgeForGuest } from "@/lib/knowledge/orders";

export type ChatLink = { label: string; href: string };
export type ChatResponse = {
  text: string;
  links: ChatLink[];
  resolved: boolean;
  /** The product this answer was about, if any — the caller (chat widget) carries
   *  this forward as ChatContext.lastProductSlug so a short follow-up like "how
   *  much is it?" can resolve without repeating the product name. Session-local
   *  only: it lives in the widget's own React state, never persisted server-side,
   *  and never shared between browser sessions. */
  subjectProductSlug?: string;
};

export type ChatContext = {
  /** Only ever set from a verified customer session — never from chat message content. */
  customerId?: string | null;
  orderNumber?: string;
  email?: string;
  /** Session-local conversation memory — see ChatResponse.subjectProductSlug. */
  lastProductSlug?: string;
};

const MAX_MESSAGE_LENGTH = 500;

// Very common texting shorthand/typos from real customer phrasing — expanding
// these before matching is plain string substitution, not language modelling,
// and keeps the deterministic matcher usable without an AI provider.
const SHORTHAND_MAP: Record<string, string> = {
  u: "you",
  ur: "your",
  av: "have",
  mch: "much",
  muchs: "much is",
  wat: "what",
  wheres: "where is",
  whats: "what is",
  mi: "my",
  dont: "do not",
  cant: "can not",
  wont: "will not",
  im: "i am",
  ive: "i have",
  sendit: "send it",
  pls: "please",
  plz: "please",
  bak: "back",
};

function expandShorthand(message: string): string {
  return message
    .split(/(\s+)/)
    .map((token) => SHORTHAND_MAP[token] ?? token)
    .join("");
}

function normalize(s: string): string {
  return expandShorthand(s.trim().toLowerCase());
}

/** Stricter normalization used only for UnansweredQuestion's dedup key — collapses
 *  whitespace and trailing punctuation so "Are these pet safe?" and "are these
 *  pet safe" count as the same question, without attempting semantic clustering. */
function normalizeForDedup(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[?!.,;:]+$/g, "").slice(0, 500);
}

function contactLine(store: StoreKnowledge): string {
  return store.supportEmail
    ? `You can contact ${store.businessName} at ${store.supportEmail}${store.supportPhone ? ` or ${store.supportPhone}` : ""}.`
    : `You can contact ${store.businessName} through the Contact Us page.`;
}

async function recordUnansweredQuestion(question: string): Promise<void> {
  const key = normalizeForDedup(question);
  if (!key) return;
  await prisma.unansweredQuestion.upsert({
    where: { question: key },
    update: { askCount: { increment: 1 }, lastAskedAt: new Date() },
    create: { question: key },
  });
}

async function unresolved(rawMessage: string, store: StoreKnowledge): Promise<ChatResponse> {
  await recordUnansweredQuestion(rawMessage).catch(() => {});
  return {
    text: `I don't have confirmed information about that yet. ${contactLine(store)}`,
    links: [{ label: "Contact us", href: "/contact" }],
    resolved: false,
  };
}

function productLink(product: PublicProductKnowledge): ChatLink {
  return { label: `View ${product.name}`, href: `/products/${product.slug}` };
}

// Generic words that appear across many/most products regardless of type —
// matching on these alone would make nearly any product-shaped question
// "confidently" match an unrelated product. Deliberately does NOT include
// product-type words (hoodie, keyring, mug, ...): in this catalogue every
// product shares the same brand-name prefix, so the type word is the ONLY
// thing that distinguishes one product from another — filtering it out here
// would strip away the sole distinctive signal for every single-item query.
const GENERIC_PRODUCT_WORDS = new Set([
  "product", "products", "gift", "gifts", "set", "sets",
  "standard", "test", "one", "ones",
  // Every product name shares this brand prefix (e.g. "Support Your Local
  // Patriot Hoodie") — without filtering these out, a query containing
  // "patriot" alone would match all products at once, the same failure mode
  // "wax"/"candle" caused before this catalogue was renamed.
  "support", "local", "patriot", "sylp",
]);

// Common English words that must never, on their own, be treated as a
// "distinctive" signal pointing at a specific product or FAQ — including
// question words and words that show up in adversarial/financial probes
// ("cost", "price", "profit"). Without this, generic conversational words
// can coincidentally exact- or fuzzy-match an unrelated product
// name (found live: "how much does royal mail actually COST you" fuzzy-
// matched a product called "COSy Nights Gift Set" purely by 1-letter edit
// distance) and answer the wrong question confidently.
const STOPWORDS = new Set([
  "what", "does", "much", "your", "have", "this", "that", "with", "from",
  "about", "when", "will", "make", "made", "need", "cost", "cheap", "price",
  "actually", "really", "just", "only", "very", "some", "were", "there",
  "their", "them", "then", "than", "also", "more", "most", "many", "such",
  "into", "over", "under", "would", "could", "should", "might", "must",
  "shall", "cannot", "order", "orders", "here", "these", "those", "even",
  "still", "sell", "make", "want", "like", "know", "tell", "give", "show",
]);

/** Small edit-distance check — tolerates a single typo ("vanila" ~ "vanilla") without any NLP/AI. */
function levenshteinWithin(a: string, b: string, maxDistance: number): boolean {
  if (Math.abs(a.length - b.length) > maxDistance) return false;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length] <= maxDistance;
}

function wordsMatch(messageWord: string, knowledgeWord: string): boolean {
  if (STOPWORDS.has(messageWord) || STOPWORDS.has(knowledgeWord)) return false;
  if (messageWord === knowledgeWord) return true;
  // Fuzzy (typo-tolerant) matching only for longer words — short words are
  // too likely to collide with an unrelated word at edit distance 1
  // ("cost" ~ "cosy" is exactly this failure mode at length 4).
  if (messageWord.length < 5 || knowledgeWord.length < 5) return false;
  return levenshteinWithin(messageWord, knowledgeWord, 1);
}

function distinctiveWords(product: PublicProductKnowledge): string[] {
  const haystack = [product.name, product.category].filter(Boolean).join(" ").toLowerCase();
  return haystack.split(/\W+/).filter((w) => w.length > 2 && !GENERIC_PRODUCT_WORDS.has(w) && !STOPWORDS.has(w));
}

function findMatchingProducts(message: string, products: PublicProductKnowledge[]): PublicProductKnowledge[] {
  const messageWords = message.split(/\W+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return products.filter((p) => distinctiveWords(p).some((kw) => messageWords.some((mw) => wordsMatch(mw, kw))));
}

function extractQuantity(message: string): number | null {
  const digitMatch = message.match(/\b(\d+)\b/);
  if (digitMatch) {
    const n = parseInt(digitMatch[1], 10);
    if (n > 0 && n <= 999) return n;
  }
  const wordNumbers: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
  for (const [word, n] of Object.entries(wordNumbers)) {
    if (new RegExp(`\\b${word}\\b`).test(message)) return n;
  }
  return null;
}

function productShortlist(products: PublicProductKnowledge[]): ChatResponse {
  const top = products.slice(0, 5);
  const lines = top.map((p) => {
    const distinction = p.category ? `${p.category}` : p.shortDescription || "";
    return `${p.name}${distinction ? ` (${distinction})` : ""} — ${formatPence(p.currentPrice)}`;
  });
  return {
    text: `We have a few options:\n${lines.join("\n")}`,
    links: top.map(productLink),
    resolved: true,
  };
}

const PRONOUN_ONLY = /^(how much (is|for) it\??|is it available\??|what size( is it)?\??|what colou?rs? does it come in\??|is it made to order\??|what'?s it made (of|from)\??)$/;
const REFERS_TO_PRIOR_SUBJECT = /\b(it|this one|that one)\b/;

async function answerOrderStatus(context: ChatContext): Promise<ChatResponse> {
  if (context.customerId) {
    const orders = await getOrderKnowledgeForCustomer(context.customerId, context.orderNumber);
    if (orders.length === 0) {
      return { text: "I couldn't find that order on your account.", links: [{ label: "My orders", href: "/account/orders" }], resolved: true };
    }
    const o = orders[0];
    const trackingLine = o.trackingNumber ? ` Tracking: ${o.trackingNumber}${o.trackingUrl ? ` (${o.trackingUrl})` : ""}.` : "";
    return {
      text: `Order ${o.orderNumber} is currently: ${o.fulfilmentStatus}.${trackingLine}`,
      links: [{ label: "View order", href: "/account/orders" }],
      resolved: true,
    };
  }

  if (context.orderNumber && context.email) {
    const order = await getOrderKnowledgeForGuest(context.orderNumber, context.email);
    if (!order) {
      return { text: "I couldn't find an order matching that order number and email.", links: [], resolved: true };
    }
    const trackingLine = order.trackingNumber ? ` Tracking: ${order.trackingNumber}${order.trackingUrl ? ` (${order.trackingUrl})` : ""}.` : "";
    return {
      text: `Order ${order.orderNumber} is currently: ${order.fulfilmentStatus}.${trackingLine}`,
      links: [],
      resolved: true,
    };
  }

  return {
    text: "To look up your order, please tell me your order number and the email address used at checkout, or log in to your account.",
    links: [{ label: "Track my order", href: "/track-order" }],
    resolved: true,
  };
}

async function answerDelivery(message: string, store: StoreKnowledge): Promise<ChatResponse> {
  const zones = await getDeliveryKnowledge();
  const wantsInternational = /\boutside uk|international|abroad\b/.test(message);
  const uk = zones.find((z) => z.countries.toLowerCase().includes("united kingdom")) ?? zones[0];

  if (wantsInternational) {
    const international = zones.find((z) => !z.countries.toLowerCase().includes("united kingdom"));
    if (!international) {
      return {
        text: "We currently only deliver within the UK.",
        links: [{ label: "Delivery information", href: "/legal/delivery" }],
        resolved: true,
      };
    }
    return {
      text: `Yes — we deliver to ${international.countries}. ${international.methodName} costs ${
        international.customerPrice === 0 ? "free" : formatPence(international.customerPrice)
      }.`,
      links: [{ label: "Delivery information", href: "/legal/delivery" }],
      resolved: true,
    };
  }

  if (!uk) return unresolved(message, store);

  const priceText = uk.customerPrice === 0 ? "free" : formatPence(uk.customerPrice);
  const freeText = uk.freeDeliveryThreshold != null ? ` Free delivery on orders over ${formatPence(uk.freeDeliveryThreshold)}.` : "";
  const daysText = uk.estimatedDays ? ` Estimated delivery: ${uk.estimatedDays}.` : "";

  return {
    text: `${uk.methodName} costs ${priceText}.${freeText}${daysText}`,
    links: [{ label: "Delivery information", href: "/legal/delivery" }],
    resolved: true,
  };
}

async function answerPolicy(message: string, store: StoreKnowledge): Promise<ChatResponse> {
  const policies = await getPolicyKnowledge();
  const wantsCancellation = message.includes("cancel");
  const slug = wantsCancellation ? "cancellation" : "returns-refunds";
  const policy = policies.find((p) => p.slug === slug) ?? policies.find((p) => p.slug.includes("return"));

  if (!policy) return unresolved(message, store);

  const summary = policy.body.replace(/\s+/g, " ").trim().slice(0, 300);
  return {
    text: summary,
    links: [{ label: policy.title, href: `/legal/${policy.slug}` }],
    resolved: true,
  };
}

async function answerCategoryList(store: StoreKnowledge): Promise<ChatResponse> {
  const products = await getProductKnowledge();
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
  if (categories.length === 0) return unresolved("category list", store);

  return {
    text: `Our current range includes: ${categories.join(", ")}.`,
    links: [{ label: "Shop all", href: "/shop" }],
    resolved: true,
  };
}

function categoryScoped(products: PublicProductKnowledge[], message: string): PublicProductKnowledge[] {
  const namedCategory = [...new Set(products.map((p) => p.category).filter(Boolean))].find((c) =>
    message.includes(c!.toLowerCase())
  ) as string | undefined;
  return namedCategory ? products.filter((p) => p.category === namedCategory) : products;
}

async function answerCheapest(message: string, store: StoreKnowledge): Promise<ChatResponse> {
  const products = await getProductKnowledge();
  const scoped = categoryScoped(products, message);

  if (scoped.length === 0) return unresolved(message, store);

  const cheapest = scoped.reduce((min, p) => (p.currentPrice < min.currentPrice ? p : min));
  return {
    text: `Our cheapest ${scoped === products ? "product" : cheapest.category} is currently ${cheapest.name} at ${formatPence(cheapest.currentPrice)}.`,
    links: [productLink(cheapest)],
    resolved: true,
    subjectProductSlug: cheapest.slug,
  };
}

function answerAboutProduct(message: string, product: PublicProductKnowledge, store: StoreKnowledge): ChatResponse | Promise<ChatResponse> {
  if (/\bbigger size|larger size|other size|what size\b/.test(message)) {
    const sizes = product.variants.filter((v) => v.size).map((v) => `${v.size} (${formatPence(v.price)})`);
    const text =
      sizes.length === 0
        ? `${product.name} is currently available in one size only.`
        : `${product.name} is available in: ${sizes.join(", ")}.`;
    return { text, links: [productLink(product)], resolved: true, subjectProductSlug: product.slug };
  }

  if (/\bmade to order\b/.test(message)) {
    const text = product.madeToOrder
      ? `Yes — ${product.name} is made to order${product.productionTimeDays ? `, please allow ${product.productionTimeDays} day${product.productionTimeDays === 1 ? "" : "s"} for production` : ""}.`
      : `${product.name} is stocked and ready to ship, not made to order.`;
    return { text, links: [productLink(product)], resolved: true, subjectProductSlug: product.slug };
  }

  if (/\bmade (of|from)\b|what'?s? it made|whats it made|what material\b/.test(message)) {
    const info = product.material;
    if (!info) return unresolved(message, store);
    return { text: `${product.name}: ${info}`, links: [productLink(product)], resolved: true, subjectProductSlug: product.slug };
  }

  if (/\b(available|in stock|do you have|can i order|can i get|still sell)\b/.test(message)) {
    const text = product.available
      ? `Yes — ${product.name} is currently available for ${formatPence(product.currentPrice)}.`
      : `${product.name} is currently out of stock.`;
    return { text, links: [productLink(product)], resolved: true, subjectProductSlug: product.slug };
  }

  // Price question (default for a resolved product) — with optional quantity.
  const quantity = extractQuantity(message);
  if (quantity && quantity > 1) {
    const lineTotal = product.currentPrice * quantity;
    return {
      text: `${quantity} x ${product.name} at ${formatPence(product.currentPrice)} each is ${formatPence(lineTotal)}.`,
      links: [productLink(product)],
      resolved: true,
      subjectProductSlug: product.slug,
    };
  }

  const priceText =
    product.saleActive && product.salePrice != null
      ? `${product.name} is currently on sale for ${formatPence(product.currentPrice)} (was ${formatPence(product.price)}).`
      : `${product.name} is ${formatPence(product.currentPrice)}.`;
  return { text: priceText, links: [productLink(product)], resolved: true, subjectProductSlug: product.slug };
}

async function answerProductQuestion(message: string, context: ChatContext, store: StoreKnowledge): Promise<ChatResponse | null> {
  const isProductQuestion =
    /\b(how much|price|cost|available|in stock|do you have|made to order|made (of|from)|what'?s? it made|whats it made|what material|bigger size|larger size|other size|what size|can i order|can i get|still sell)\b/.test(
      message
    );
  if (!isProductQuestion) return null;

  const products = await getProductKnowledge();
  let matches = findMatchingProducts(message, products);

  // "black hoodie" should mean the hoodie, not also a t-shirt in the same
  // colour — narrow by category when the customer named one and it actually
  // distinguishes the matches.
  const narrowedByCategory = categoryScoped(matches, message);
  if (matches.length > 1 && narrowedByCategory.length > 0 && narrowedByCategory.length < matches.length) {
    matches = narrowedByCategory;
  }

  if (matches.length > 1) return productShortlist(matches);

  if (matches.length === 1) return answerAboutProduct(message, matches[0], store);

  // No named product matched. If this reads as a pure pronoun follow-up
  // ("how much is it?", "is it available?") try the session-local subject
  // from the previous turn rather than asking again straight away.
  if (REFERS_TO_PRIOR_SUBJECT.test(message) || PRONOUN_ONLY.test(message)) {
    if (context.lastProductSlug) {
      const product = await getProductKnowledgeBySlug(context.lastProductSlug);
      if (product) return answerAboutProduct(message, product, store);
    }
    return {
      text: "Which product would you like to know about? You can tell me its name, e.g. \"Vanilla Dream\".",
      links: [{ label: "Shop all", href: "/shop" }],
      resolved: true,
    };
  }

  return null;
}

async function answerProductDiscovery(message: string): Promise<ChatResponse | null> {
  const isDiscovery = /\b(what .* (do you sell|have you got|do you have|do you offer)|show me|anything|what have you got|u got|you got)\b/.test(
    message
  );
  if (!isDiscovery) return null;

  const products = await getProductKnowledge();
  const scoped = categoryScoped(products, message);

  // "anything with a union jack" / "show me hoodies" style — a specific term was named.
  const messageWords = message.split(/\W+/).filter((w) => w.length > 3 && !GENERIC_PRODUCT_WORDS.has(w) && !STOPWORDS.has(w));

  if (messageWords.length === 0) {
    // Pure category browsing ("what hoodies do you sell") — no specific
    // term to match against, so the scoped catalogue itself is the answer.
    return scoped.length > 0 ? productShortlist(scoped) : null;
  }

  // A specific term WAS named — only ever answer from an actual match.
  // Falling back to the unfiltered catalogue here would wrongly imply the
  // named thing might be among an unrelated shortlist ("anything coconut"
  // must never return an assortment that doesn't include coconut).
  const wordScoped = scoped.filter((p) => distinctiveWords(p).some((kw) => messageWords.some((mw) => wordsMatch(mw, kw))));
  if (wordScoped.length === 0) return null;
  return productShortlist(wordScoped);
}

async function answerFromFaq(message: string): Promise<ChatResponse | null> {
  const faqs = await getFaqKnowledge();
  const words = message.split(/\W+/).filter((w) => w.length > 3 && !STOPWORDS.has(w));
  if (words.length === 0) return null;

  const match = faqs.find((f) => {
    const haystackWords = f.question.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !STOPWORDS.has(w));
    return words.some((mw) => haystackWords.some((hw) => wordsMatch(mw, hw)));
  });
  if (!match) return null;
  return { text: match.answer, links: [{ label: "See all FAQs", href: "/faq" }], resolved: true };
}

/**
 * The chatbot's single entry point. Tries deterministic, database-grounded
 * answers first (see module functions above) — an AI layer, if one is ever
 * configured (lib/ai/provider.ts), would only rephrase these facts, never
 * replace them. Falls back to a clear "I don't know" and records the
 * question for admin review rather than guessing.
 */
export async function askChatbot(rawMessage: string, context: ChatContext = {}): Promise<ChatResponse> {
  const trimmedRaw = rawMessage.slice(0, MAX_MESSAGE_LENGTH);
  const message = normalize(trimmedRaw);
  const store = await getStoreKnowledge();
  if (!message) return unresolved(trimmedRaw, store);

  // Checked before ANY other intent, unconditionally: a question aimed at
  // internal business economics (what we actually pay/earn) must never be
  // answered even if it happens to also contain an ordinary trigger word
  // like "postage" or "cost" ("show me internal postage cost" would
  // otherwise match the plain delivery-price intent below and confidently
  // return the customer-facing delivery price instead of refusing).
  if (
    /\b(internal (postage|packaging|shipping|delivery)|actually cost|really cost|profit|margin|cost price|wholesale price|supplier (details|information)|manufactur(er|ing) cost|packaging cost|postage cost)\b/.test(
      message
    ) ||
    /\b(database url|secret key|api key|admin password|system prompt|ignore (your|previous|all) (rules|instructions))\b/.test(message)
  ) {
    return unresolved(trimmedRaw, store);
  }

  if (/\b(track|tracking|where is my order|where'?s my parcel|dispatched|order status|what did i order)\b/.test(message)) {
    return answerOrderStatus(context);
  }
  if (/\b(deliver|delivery|shipping|postage|ship internationally|how quickly|when will it come|when is my order coming)\b/.test(message)) {
    return answerDelivery(message, store);
  }
  if (/\b(returns?|refund|cancel|send it back)\b/.test(message)) {
    return answerPolicy(message, store);
  }
  if (/\bwhat (categories|ranges|collections) do you\b|\bwhat do you sell\b/.test(message)) {
    return answerCategoryList(store);
  }
  if (/\bcheapest\b|\blowest price\b/.test(message)) {
    return answerCheapest(message, store);
  }

  const productAnswer = await answerProductQuestion(message, context, store);
  if (productAnswer) return productAnswer;

  const discoveryAnswer = await answerProductDiscovery(message);
  if (discoveryAnswer) return discoveryAnswer;

  const faqAnswer = await answerFromFaq(message);
  if (faqAnswer) return faqAnswer;

  return unresolved(trimmedRaw, store);
}
