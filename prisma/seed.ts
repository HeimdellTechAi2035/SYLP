// Seeds enough data for the store to run and be demoed immediately.
// All product copy below is clearly placeholder content for a fictional
// first collection — replace it from /admin once real products, photography
// and legal wording are ready. No reviews are seeded: reviews must only ever
// come from genuine customers.
// Default-import + destructure, not `import { PrismaClient }` — run directly
// via `node --experimental-strip-types` (not bundled by Next.js/webpack),
// Node's native ESM loader treats @prisma/client as CommonJS and rejects a
// named import of it.
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
const { PrismaClient } = pkg;

// Full draft policy text for the storefront's /legal/[slug] pages.
//
// IMPORTANT: this is an AI-drafted starting point informed by the UK laws
// that apply to a small consumer ecommerce business (Consumer Rights Act
// 2015, Consumer Contracts (Information, Cancellation and Additional
// Charges) Regulations 2013, UK GDPR / Data Protection Act 2018, Privacy
// and Electronic Communications Regulations (PECR)) — it is NOT legal advice
// and has NOT been reviewed by a solicitor. Every Policy row this seeds is
// still created with isDraft: true, which keeps the storefront's "not yet
// reviewed — do not treat as legally binding" banner visible. Get this
// reviewed by a solicitor before relying on it, then flip isDraft off for
// each policy from Admin → Policies.
//
// Facts used throughout, kept consistent with what's actually configured
// elsewhere in the app (SiteSettings, DeliveryZone, the seeded product
// catalogue) rather than invented figures:
// - Trading name: Support Your Local Patriot ("SYLP")
// - Legal entity: Heimdell Tech Ai Ltd, registered in England & Wales,
//   Company No. 16478408, Preston, PR1 9DJ
// - ICO registration: ZC079121
// - Contact: support@support-your-local-patriot.online (general),
//   complaints@support-your-local-patriot.online (complaints)
// - UK delivery only, standard price £2.95, free over £35, dispatch 1-3
//   working days, delivery 2-4 working days (matches this file's seeded values)
// - The engraved wallet is made to order (personalised) — legally distinct
//   from the rest of the catalogue for cancellation-right purposes
const COMPANY_LINE =
  "Support Your Local Patriot is operated by Heimdell Tech Ai Ltd, a company registered in England & Wales (Company No. 16478408), registered office Preston, PR1 9DJ (\"we\", \"us\", \"our\").";

const POLICY_BODIES: Record<string, string> = {
  terms: `${COMPANY_LINE}

These terms and conditions apply to every order placed through this website. By placing an order you agree to be bound by them.

1. Our contract with you
When you place an order, we'll send you an email acknowledging we've received it — this is not an acceptance of your order. A contract between us is only formed when we send you a separate email confirming dispatch (or, for made-to-order items, confirming your order has entered production).

2. Products and pricing
We take reasonable care to ensure prices and product descriptions are accurate. All prices are shown in GBP and, where applicable, are inclusive of VAT. If we discover a pricing error before dispatch, we'll contact you to confirm you're happy to proceed at the correct price, or to cancel the order with a full refund.

3. Payment
Payment is taken securely at checkout via Stripe. We do not store your card details.

4. Delivery
See our Delivery Policy for current delivery areas, costs and timescales.

5. Your right to cancel
Most orders can be cancelled within 14 days of receipt for a full refund — see our Cancellation Policy and Returns & Refunds Policy for full details, including the exception for personalised/made-to-order items such as the engraved wallet.

6. Faulty or damaged goods
If an item arrives faulty, damaged or not as described, you have rights under the Consumer Rights Act 2015 that are not affected by anything in these terms — see our Returns & Refunds Policy.

7. Our liability
We are responsible for loss or damage you suffer that is a foreseeable result of our breaking this contract or failing to use reasonable care and skill, but we are not responsible for loss or damage that is not foreseeable. Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence, for fraud, or for any other liability that cannot be excluded or limited under English law.

8. Events outside our control
We won't be liable for any failure or delay in performing our obligations where that failure results from events outside our reasonable control.

9. Complaints
If something goes wrong, please see our Complaints Policy for how to raise it with us.

10. Governing law
These terms are governed by the law of England and Wales. Any dispute will be subject to the non-exclusive jurisdiction of the courts of England and Wales. If you live in Scotland or Northern Ireland, you may also bring proceedings in your local courts.

11. Changes to these terms
We may update these terms from time to time; the version that applied when you placed your order is the one that governs that order.`,

  privacy: `${COMPANY_LINE} We are the data controller for the personal data described in this policy. Our ICO registration number is ZC079121.

1. What personal data we collect
When you place an order, contact us, create an account, or sign up to our mailing list, we may collect: your name, email address, postal address, phone number, order history, and any message content you send us. We do not collect or store your full payment card details — these are handled directly by our payment processor, Stripe.

2. How we use your data and our legal basis
- To fulfil and deliver your order, and to handle returns, refunds and warranty claims — necessary to perform our contract with you.
- To respond to enquiries, complaints and customer service requests — necessary to perform our contract with you, or our legitimate interest in resolving issues.
- To send you order and delivery updates — necessary to perform our contract with you.
- To send you marketing emails about new products or offers, where you've opted in — based on your consent, which you can withdraw at any time.
- To detect and prevent fraud, and to keep our systems secure — our legitimate interest in protecting our business and customers.
- To comply with our legal obligations, such as tax and accounting records.

3. Who we share your data with
We share the minimum data necessary with: Stripe (payment processing), our delivery couriers (to deliver your order), and any admin notification/email service providers we use to run the store. We never sell your personal data.

4. International transfers
Some of our service providers (such as Stripe) may process data outside the UK. Where this happens, we rely on appropriate safeguards, such as the UK's international data transfer mechanisms, to ensure your data remains protected.

5. How long we keep your data
We keep order and account data for as long as necessary to fulfil the purposes described above and to meet our legal and accounting obligations (typically at least 6 years for financial records). Marketing consent is kept until you unsubscribe.

6. Your rights
Under UK GDPR, you have the right to: access the personal data we hold about you; have inaccurate data corrected; request erasure; restrict or object to processing; request your data in a portable format; and withdraw consent at any time. To exercise any of these rights, contact us at support@support-your-local-patriot.online.

7. Cookies
Our website uses cookies — see our Cookie Policy for details.

8. Security
We use appropriate technical and organisational measures to protect your personal data, including encrypted connections (HTTPS) and secure, access-controlled admin accounts.

9. Children
Our products and services are not directed at, or intended for purchase by, children.

10. Complaints
If you're unhappy with how we've handled your personal data, please contact us first at support@support-your-local-patriot.online. You also have the right to complain to the Information Commissioner's Office (ICO) at ico.org.uk or on 0303 123 1113.`,

  cookies: `This Cookie Policy explains how Support Your Local Patriot ("we", "us") uses cookies and similar technologies on this website.

1. What are cookies
Cookies are small text files stored on your device when you visit a website. They help the site function correctly and can also be used to remember your preferences or gather anonymous usage statistics.

2. The cookies we use
- Strictly necessary cookies: used to keep your basket contents and, if you sign in, your account or admin session working correctly. The site cannot function without these, so they are set regardless of cookie consent.
- Analytics cookies: if enabled in our site settings, used to understand how visitors use the site so we can improve it. These are only set with your consent.
- Marketing cookies: if enabled in our site settings, used to measure the effectiveness of advertising. These are only set with your consent.

3. Managing cookies
When you first visit the site, you can choose which non-essential cookies to allow via our cookie banner. You can also control or delete cookies at any time through your browser settings — see your browser's help pages for instructions. Blocking non-essential cookies won't stop you shopping with us, but blocking strictly necessary cookies may prevent the basket and checkout from working correctly.

4. Changes to this policy
We may update this policy from time to time to reflect changes in the cookies we use.

If you have any questions about our use of cookies, contact us at support@support-your-local-patriot.online.`,

  delivery: `${COMPANY_LINE}

1. Where we deliver
We currently deliver within the United Kingdom only.

2. Dispatch times
Orders are typically dispatched within 1-3 working days of being placed. Made-to-order items — currently the engraved wallet — need additional production time before dispatch; the current lead time is shown on that product's page.

3. Delivery times
Once dispatched, standard UK delivery typically takes 2-4 working days.

4. Delivery costs
Standard UK delivery costs £2.95. We offer free UK delivery on orders over £35 — the current threshold is always shown at checkout.

5. Order tracking
Once your order has been dispatched, you can check its status from your account or via our Track Your Order page.

6. Failed, delayed or lost deliveries
If your order hasn't arrived within the expected timeframe, please contact us at support@support-your-local-patriot.online with your order number so we can investigate with the courier.

7. Risk and ownership
Risk in the goods passes to you when they're delivered to the address you provided. Ownership passes to you once we've received payment in full.`,

  "returns-refunds": `${COMPANY_LINE}

1. Your right to cancel
For most items, you have the right to cancel your order within 14 days of receiving it, without giving a reason, under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013. To exercise this right, contact us at support@support-your-local-patriot.online with your order number.

2. Items excluded from the right to cancel
Personalised or made-to-order items — currently the engraved wallet — are exempt from the right to cancel once production has begun, as they are made to your specification (Regulation 28(1)(b) of the above Regulations). This does not affect your rights if the item is faulty or not as described.

3. How to return an item
Contact us first so we can confirm the return and give you the correct return address. You are responsible for the cost of returning an item unless it's faulty, damaged, or not as described, or unless we tell you otherwise.

4. Condition of returned items
Items should be returned unused, in their original packaging where possible, and in the same condition you received them. You're liable for any diminished value resulting from unnecessary handling beyond what's needed to establish the item's nature and features.

5. Refunds
Once we've received the returned item (or evidence you've sent it back), we'll issue your refund within 14 days, using the same payment method you used to pay. Original standard delivery charges are refunded in full for a full-order cancellation; return postage costs are not refunded unless the item is faulty.

6. Faulty, damaged or misdescribed items
If an item is faulty, arrives damaged, or doesn't match its description, you have additional rights under the Consumer Rights Act 2015 — including, in the first 30 days, the right to a full refund. After 30 days, we'll offer a repair or replacement, or a price reduction/refund if that's not possible. This applies even to made-to-order items like the engraved wallet. Contact us at support@support-your-local-patriot.online with photos of the issue where possible.

7. Gift returns
If you received an item as a gift, please contact us and we'll do our best to help, though refunds can normally only be issued to the original payment method.`,

  cancellation: `${COMPANY_LINE}

1. Your legal right to cancel
Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, you have the right to cancel your order within 14 days of receiving your goods, without giving a reason.

2. How to cancel
To cancel, contact us at support@support-your-local-patriot.online with your order number, ideally before the item is dispatched — if it's already on its way, follow our Returns & Refunds Policy instead. If you cancel before dispatch, we won't charge or ship the item.

3. Effect of cancellation
If you cancel within the 14-day period, we'll refund all payments received from you, including standard delivery charges, within 14 days of being informed of your decision to cancel (or, for goods already sent, within 14 days of receiving the goods back or evidence you've returned them).

4. Items excluded from cancellation
Personalised or made-to-order items — currently the engraved wallet — cannot be cancelled once production has started, as they're made to your specification. This doesn't affect your rights if the item turns out to be faulty.

5. Order changes
If you'd like to change an item, size or address rather than cancel entirely, contact us as soon as possible — we're often able to help before an order is dispatched, even outside the formal cancellation process.`,

  complaints: `To raise a complaint, please email complaints@support-your-local-patriot.online. ${COMPANY_LINE}

1. How to complain
We want to know if something's gone wrong. Please email complaints@support-your-local-patriot.online with your order number (if applicable) and details of your complaint.

2. What happens next
We aim to acknowledge every complaint within 2 working days, and to give you a full response or a clear update within 10 working days. If a complaint is complex and needs longer, we'll let you know and keep you updated on progress.

3. If you're not satisfied
If you're unhappy with how we've handled your complaint, you can contact Citizens Advice (citizensadvice.org.uk) for free, impartial guidance on your consumer rights, or your local Trading Standards service. For complaints about how we handle your personal data specifically, you can also contact the Information Commissioner's Office (ico.org.uk).`,

  "product-care": `General care guidance for our range. Always check the specific care instructions listed on each product's page first, as these take priority over the general guidance below.

Apparel (hoodies, t-shirts)
Machine wash cold and inside-out to protect the print, and avoid tumble drying — heat is the most common cause of prints cracking or peeling over time.

Drinkware (mugs)
Enamel mugs should be hand washed — they are not microwave or dishwasher safe, as this can damage the enamel coating and printed design.

Printed accessories (stickers, phone cases)
Our stickers are weatherproof and designed for outdoor use, but avoid abrasive cleaning. Phone cases can be wiped clean with a soft, slightly damp cloth.

Leather and engraved goods (wallet)
Wipe clean with a dry cloth only. Avoid prolonged exposure to water or direct sunlight, both of which can fade or warp leather over time.

General
Store items away from direct heat and sunlight when not in use, and follow any specific instructions included with your order. If you're ever unsure how to care for something you've bought from us, contact us at support@support-your-local-patriot.online.`,

  accessibility: `We want everyone to be able to use this website comfortably, regardless of ability.

1. Our commitment
We aim for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, covering things like keyboard navigation, readable colour contrast, and screen-reader-friendly page structure.

2. What we've done
We've built the site with visible keyboard focus states, semantic heading structure, and accessible labels on interactive elements like forms and buttons.

3. Known limitations
We're aware some third-party embedded content (such as social media widgets, if used) may not fully meet the same standard, and we're working to review this over time.

4. Feedback
If you find any part of this website difficult to use, please tell us — email support@support-your-local-patriot.online with details of the page and the issue, and we'll do our best to fix it.`,
};

// Netlify DB injects the local connection string as NETLIFY_DB_URL when this
// runs through `netlify dev --command` (as db:seed does) — never as
// DATABASE_URL. Same fallback as lib/prisma.ts and prisma7.config.ts.
const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — run this via `netlify dev --command` or with DATABASE_URL exported.");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Admin user -----------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || "admin@support-your-local-patriot.online";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "OWNER",
      // The seeded password is a known, documented default — force it to be
      // changed on first login rather than trusting it stays private.
      mustChangePassword: true,
    },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  // --- Site settings ----------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: "Support Your Local Patriot",
      supportEmail: "support@support-your-local-patriot.online",
      freeDeliveryThreshold: 3500,
      standardDeliveryPrice: 295,
      estimatedDispatchDays: "1-3 working days",
      estimatedDeliveryDays: "2-4 working days",
      instagramUrl: null,
      facebookUrl: null,
    },
  });

  // --- Homepage content ---------------------------------------------------
  await prisma.homepageContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      announcementBarText: "New drop just landed · UK delivery available · Free delivery over £35",
      heroTitle: "Support Your Local Patriot",
      heroSubtitle:
        "Proud, patriotic apparel and everyday essentials — printed and packed to order right here in the UK. Every order is fulfilled by a small independent business, not a warehouse, so shopping with us means backing someone local instead of a faceless corporation.",
      heroCtaPrimaryLabel: "Shop Hoodies",
      heroCtaPrimaryHref: "/collections/hoodies",
      heroCtaSecondaryLabel: "Shop All",
      heroCtaSecondaryHref: "/shop",
      heroImage: "/products/hoodie-front.jpg",
      storyTitle: "Support Your Local Patriot",
      storyBody:
        "Support Your Local Patriot started with a simple idea: give people who are proud of where they're from something real to wear it with. Not mass-produced, not outsourced overseas — printed and packed to order right here in the UK, with every item checked by hand before it reaches you.",
      giftSectionTitle: "The perfect gift, ready to give",
      giftSectionBody:
        "Giftable sets and accessories for birthdays, thank-yous and every occasion in between — each one packed with the same care as if we were keeping it for ourselves.",
    },
  });

  await prisma.homepageFeature.deleteMany({ where: { section: "WHY_SHOP" } });
  await prisma.homepageFeature.createMany({
    data: [
      { section: "WHY_SHOP", icon: "sparkles", title: "Quality made", body: "Every item is printed and finished with care.", sortOrder: 0 },
      { section: "WHY_SHOP", icon: "package", title: "Small-batch", body: "Made in limited runs, never mass-produced.", sortOrder: 1 },
      { section: "WHY_SHOP", icon: "gift", title: "Giftable", body: "Thoughtful packaging, ready to give.", sortOrder: 2 },
      { section: "WHY_SHOP", icon: "shield", title: "Secure checkout", body: "Payments processed securely via Stripe.", sortOrder: 3 },
      { section: "WHY_SHOP", icon: "truck", title: "UK delivery", body: "Dispatched from the UK — get in touch if you'd like tracking added.", sortOrder: 4 },
    ],
  });

  // --- Delivery zones -------------------------------------------------
  const ukZone = await prisma.deliveryZone.findFirst({ where: { name: "UK Standard" } });
  if (!ukZone) {
    await prisma.deliveryZone.create({
      data: {
        name: "UK Standard",
        countries: "United Kingdom",
        price: 295,
        freeThreshold: 3500,
        estimatedDays: "2-4 working days",
        sortOrder: 0,
      },
    });
  }

  // --- Categories -------------------------------------------------------
  const categories = [
    { slug: "hoodies", name: "Hoodies", description: "Heavyweight printed hoodies.", sortOrder: 0, image: "/products/hoodie-front.jpg" },
    { slug: "t-shirts", name: "T-Shirts", description: "Soft, printed cotton tees.", sortOrder: 1, image: "/products/tshirt-front.jpg" },
    { slug: "keyrings", name: "Keyrings", description: "Durable metal and enamel keyrings.", sortOrder: 2 },
    { slug: "stickers", name: "Stickers", description: "Weatherproof vinyl stickers.", sortOrder: 3 },
    { slug: "cups", name: "Cups", description: "Enamel mugs and travel cups.", sortOrder: 4 },
    { slug: "pens", name: "Pens", description: "Branded everyday pens.", sortOrder: 5 },
    { slug: "phone-cases", name: "Phone Cases", description: "Protective printed phone cases.", sortOrder: 6 },
    { slug: "puzzles", name: "Puzzles", description: "Jigsaw puzzle boards.", sortOrder: 7 },
    { slug: "wallets", name: "Wallets", description: "Engraved leather wallets.", sortOrder: 8 },
    { slug: "wristbands", name: "Wristbands", description: "Silicone wristbands.", sortOrder: 9 },
    { slug: "bags", name: "Bags", description: "Reusable shopping bags.", sortOrder: 10 },
    { slug: "gift-sets", name: "Gift Sets", description: "Curated gift sets, ready to give.", sortOrder: 11 },
  ];
  const categoryRecords: Record<string, string> = {};
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryRecords[cat.slug] = record.id;
  }

  // --- Products -----------------------------------------------------------
  const products = [
    {
      slug: "preston-patriot-hoodie",
      sku: "HD-100",
      name: "Support Your Local Patriot Hoodie",
      category: "hoodies",
      productType: "APPAREL",
      price: 5500,
      stockQuantity: 40,
      material: "80% cotton, 20% polyester fleece",
      careInstructions: "Machine wash cold, inside out. Do not tumble dry or iron the print.",
      netWeightGrams: 650,
      shortDescription: "A heavyweight printed hoodie for everyday wear.",
      description: "Soft fleece-lined hoodie with a durable front print. Printed and packed to order in the UK.",
      bestSeller: true,
      featured: true,
      mainImage: "/products/hoodie-front.jpg",
      images: [
        { url: "/products/hoodie-front.jpg", altText: "Support Your Local Patriot Hoodie, front view" },
        { url: "/products/hoodie-back.jpg", altText: "Support Your Local Patriot Hoodie, back print detail" },
      ],
    },
    {
      slug: "preston-patriot-t-shirt",
      sku: "TS-200",
      name: "Support Your Local Patriot T-Shirt",
      category: "t-shirts",
      productType: "APPAREL",
      price: 2499,
      stockQuantity: 60,
      material: "100% ringspun cotton",
      careInstructions: "Machine wash cold, inside out. Do not tumble dry.",
      netWeightGrams: 200,
      shortDescription: "A soft, everyday printed tee.",
      description: "Classic-fit cotton t-shirt with a durable front print.",
      isNew: true,
      mainImage: "/products/tshirt-front.jpg",
      images: [
        { url: "/products/tshirt-front.jpg", altText: "Support Your Local Patriot T-Shirt, front view" },
        { url: "/products/tshirt-back.jpg", altText: "Support Your Local Patriot T-Shirt, back print detail" },
      ],
    },
    {
      slug: "preston-patriot-keyring",
      sku: "KR-300",
      name: "Support Your Local Patriot Keyring",
      category: "keyrings",
      productType: "ACCESSORY",
      price: 600,
      stockQuantity: 100,
      material: "Zinc alloy with enamel fill",
      safetyWarnings: "Small parts — choking hazard for children under 3 years.",
      shortDescription: "A durable enamel keyring.",
      description: "Hard enamel keyring on a sturdy split ring, finished with a polished edge.",
    },
    {
      slug: "preston-patriot-sticker-pack",
      sku: "ST-400",
      name: "Support Your Local Patriot Sticker Pack",
      category: "stickers",
      productType: "ACCESSORY",
      price: 450,
      stockQuantity: 150,
      material: "Weatherproof vinyl",
      netWeightGrams: 10,
      shortDescription: "A pack of weatherproof vinyl stickers.",
      description: "Set of die-cut vinyl stickers, UV and water resistant — built to last outdoors.",
      giftable: true,
    },
    {
      slug: "preston-patriot-enamel-mug",
      sku: "CP-500",
      name: "Support Your Local Patriot Enamel Mug",
      category: "cups",
      productType: "DRINKWARE",
      price: 1200,
      stockQuantity: 50,
      material: "Enamel-coated steel",
      careInstructions: "Hand wash only — not microwave or dishwasher safe.",
      shortDescription: "A classic enamel mug.",
      description: "Durable enamel-coated steel mug with a printed design, ideal for camping or everyday use.",
      bestSeller: true,
      giftable: true,
    },
    {
      slug: "preston-patriot-pen",
      sku: "PN-600",
      name: "Support Your Local Patriot Pen",
      category: "pens",
      productType: "STATIONERY",
      price: 350,
      stockQuantity: 200,
      material: "Recycled ABS plastic",
      shortDescription: "A smooth-writing branded pen.",
      description: "Everyday ballpoint pen with black ink and a printed barrel.",
    },
    {
      slug: "preston-patriot-phone-case",
      sku: "PC-700",
      name: "Support Your Local Patriot Phone Case",
      category: "phone-cases",
      productType: "ACCESSORY",
      price: 1500,
      stockQuantity: 35,
      material: "Shockproof TPU and polycarbonate",
      shortDescription: "A protective printed phone case.",
      description: "Slim, shockproof case with a durable printed design. Select your phone model at checkout.",
      isNew: true,
    },
    {
      slug: "preston-patriot-puzzle-board",
      sku: "PZ-800",
      name: "Support Your Local Patriot Puzzle Board",
      category: "puzzles",
      productType: "HOMEWARE",
      price: 2200,
      stockQuantity: 20,
      material: "Recycled cardboard, 500 pieces",
      dimensions: "40cm x 50cm assembled",
      safetyWarnings: "Small parts — choking hazard for children under 3 years.",
      shortDescription: "A 500-piece jigsaw puzzle.",
      description: "500-piece jigsaw puzzle printed on recycled board, finished with a matte coating.",
      giftable: true,
    },
    {
      slug: "preston-patriot-engraved-wallet",
      sku: "WL-900",
      name: "Support Your Local Patriot Engraved Wallet",
      category: "wallets",
      productType: "ACCESSORY",
      price: 2800,
      stockQuantity: 0,
      madeToOrder: true,
      productionTimeDays: 3,
      material: "Genuine leather, laser engraved",
      careInstructions: "Wipe clean with a dry cloth. Avoid prolonged exposure to water or direct sunlight.",
      shortDescription: "A genuine leather wallet, laser engraved to order.",
      description: "Bifold leather wallet with card slots, laser engraved to order — please allow extra time for engraving before dispatch.",
      featured: true,
      giftable: true,
    },
    {
      slug: "preston-patriot-wristband",
      sku: "WB-1000",
      name: "Support Your Local Patriot Wristband",
      category: "wristbands",
      productType: "ACCESSORY",
      price: 400,
      stockQuantity: 200,
      material: "Silicone",
      shortDescription: "A debossed silicone wristband.",
      description: "One-size silicone wristband with a debossed design.",
    },
    {
      slug: "preston-patriot-shopping-bag",
      sku: "BAG-1100",
      name: "Support Your Local Patriot Shopping Bag",
      category: "bags",
      productType: "ACCESSORY",
      price: 900,
      stockQuantity: 80,
      material: "Heavyweight cotton canvas",
      careInstructions: "Spot clean or hand wash cold. Do not tumble dry.",
      shortDescription: "A reusable cotton canvas shopping bag.",
      description: "Heavyweight cotton canvas tote with reinforced handles, printed on both sides.",
      giftable: true,
    },
  ] as const;

  const productRecords: Record<string, string> = {};
  for (const [i, p] of products.entries()) {
    const record = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        status: "ACTIVE",
        productType: p.productType,
        categoryId: categoryRecords[p.category],
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: 5,
        madeToOrder: "madeToOrder" in p ? Boolean(p.madeToOrder) : false,
        productionTimeDays: "productionTimeDays" in p ? p.productionTimeDays : null,
        material: p.material,
        careInstructions: "careInstructions" in p ? p.careInstructions : null,
        netWeightGrams: "netWeightGrams" in p ? p.netWeightGrams : null,
        dimensions: "dimensions" in p ? p.dimensions : null,
        safetyWarnings: "safetyWarnings" in p ? p.safetyWarnings : null,
        featured: "featured" in p ? Boolean(p.featured) : i === 0,
        bestSeller: "bestSeller" in p ? Boolean(p.bestSeller) : false,
        isNew: "isNew" in p ? Boolean(p.isNew) : false,
        giftable: "giftable" in p ? Boolean(p.giftable) : false,
        mainImage: "mainImage" in p ? p.mainImage : null,
      },
    });
    productRecords[p.slug] = record.id;

    if ("images" in p && p.images) {
      await prisma.productImage.deleteMany({ where: { productId: record.id } });
      await prisma.productImage.createMany({
        data: p.images.map((img, sortOrder) => ({
          productId: record.id,
          url: img.url,
          altText: img.altText,
          sortOrder,
        })),
      });
    }
  }

  const giftSet = await prisma.product.upsert({
    where: { slug: "starter-pack-gift-set" },
    update: {},
    create: {
      slug: "starter-pack-gift-set",
      sku: "GS-1200",
      name: "Starter Pack Gift Set",
      status: "ACTIVE",
      productType: "GIFT_SET",
      categoryId: categoryRecords["gift-sets"],
      shortDescription: "A keyring, sticker pack and wristband, gift-boxed and ready to give.",
      description: "A curated bundle pairing our keyring, sticker pack and wristband, presented in gift packaging.",
      price: 1300,
      stockQuantity: 25,
      lowStockThreshold: 5,
      giftPackagingAvailable: true,
      giftMessageEnabled: true,
      featured: true,
      giftable: true,
    },
  });

  await prisma.giftSetItem.deleteMany({ where: { giftSetId: giftSet.id } });
  await prisma.giftSetItem.createMany({
    data: [
      { giftSetId: giftSet.id, componentId: productRecords["preston-patriot-keyring"], quantity: 1 },
      { giftSetId: giftSet.id, componentId: productRecords["preston-patriot-sticker-pack"], quantity: 1 },
      { giftSetId: giftSet.id, componentId: productRecords["preston-patriot-wristband"], quantity: 1 },
    ],
  });

  // --- FAQ ------------------------------------------------------------
  const faqCount = await prisma.faqItem.count();
  if (faqCount === 0) {
    await prisma.faqItem.createMany({
      data: [
        { category: "Sizing", question: "What size should I order?", answer: "Check the size guide on each hoodie or t-shirt product page — our fit runs true to size. If you're between sizes, we recommend sizing up.", sortOrder: 0 },
        { category: "Materials & Care", question: "How do I wash my hoodie or t-shirt?", answer: "Machine wash cold, inside out, and avoid tumble drying to protect the print. Full care instructions are listed on each product page.", sortOrder: 1 },
        { category: "Orders", question: "How long will my order take to arrive?", answer: "Orders are typically dispatched within 1-3 working days, with UK delivery taking 2-4 working days after dispatch.", sortOrder: 2 },
        { category: "Delivery", question: "Do you offer free delivery?", answer: "Yes — free UK delivery is available on orders over the threshold shown at checkout.", sortOrder: 3 },
        { category: "Returns", question: "Can I return my order?", answer: "See our Returns & Refunds policy for full details on eligibility and how to start a return.", sortOrder: 4 },
        { category: "Products", question: "Is the engraved wallet made to order?", answer: "Yes — please allow a few extra days for engraving before dispatch; see the product page for the current lead time.", sortOrder: 5 },
      ],
    });
  }

  // --- Policies. Full draft text lives in prisma/policy-content.ts — an
  // AI-drafted starting point informed by UK consumer/data-protection law,
  // NOT a substitute for solicitor review (see that file's module comment).
  // Every row is still created with isDraft: true, which keeps the
  // storefront's "not yet reviewed — do not treat as legally binding" banner
  // visible until someone with legal authority reviews it and flips the flag
  // off from Admin → Policies. -----
  const policies = [
    { slug: "terms", title: "Terms & Conditions" },
    { slug: "privacy", title: "Privacy Policy" },
    { slug: "cookies", title: "Cookie Policy" },
    { slug: "delivery", title: "Delivery Policy" },
    { slug: "returns-refunds", title: "Returns & Refunds Policy" },
    { slug: "cancellation", title: "Cancellation Policy" },
    { slug: "complaints", title: "Complaints Policy" },
    { slug: "product-care", title: "Product Care Guide" },
    { slug: "accessibility", title: "Accessibility Statement" },
  ];

  for (const policy of policies) {
    const body =
      POLICY_BODIES[policy.slug] ??
      `We're finalising the wording for our ${policy.title}. Please check back soon, or contact us if you have any questions in the meantime.`;

    await prisma.policy.upsert({
      where: { slug: policy.slug },
      update: {},
      create: {
        slug: policy.slug,
        title: policy.title,
        body,
        isDraft: true,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
