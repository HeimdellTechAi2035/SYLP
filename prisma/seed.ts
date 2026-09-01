// Seeds enough data for the store to run and be demoed immediately.
// All product/fragrance copy below is clearly placeholder content for a
// fictional first collection — replace it from /admin once real products,
// photography and legal wording are ready. No reviews are seeded: reviews
// must only ever come from genuine customers.
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Admin user -----------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || "owner@handmadebymia.co.uk";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Mia",
      role: "OWNER",
    },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  // --- Site settings ----------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: "HandMade by Mia",
      supportEmail: adminEmail,
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
      announcementBarText: "Handmade with care · UK delivery available · Free delivery over £35",
      heroTitle: "Beautiful home fragrance, handmade by Mia",
      heroSubtitle:
        "Small-batch wax melts and candles, poured and packed by hand in the UK. [Placeholder copy — replace with confirmed brand messaging.]",
      heroCtaPrimaryLabel: "Shop Wax Melts",
      heroCtaPrimaryHref: "/collections/wax-melts",
      heroCtaSecondaryLabel: "Shop Candles",
      heroCtaSecondaryHref: "/collections/candles",
      storyTitle: "Handmade by Mia",
      storyBody:
        "[Placeholder] Every wax melt and candle is hand-poured in small batches, checked, and packed with care before it comes to you. Replace this with Mia's real story once written.",
      giftSectionTitle: "The perfect gift, ready to give",
      giftSectionBody:
        "[Placeholder] Giftable sets for birthdays, thank-yous and every occasion in between.",
    },
  });

  await prisma.homepageFeature.deleteMany({ where: { section: "WHY_SHOP" } });
  await prisma.homepageFeature.createMany({
    data: [
      { section: "WHY_SHOP", icon: "sparkles", title: "Handmade", body: "Every item is poured and finished by hand.", sortOrder: 0 },
      { section: "WHY_SHOP", icon: "package", title: "Small-batch", body: "Made in limited runs, never mass-produced.", sortOrder: 1 },
      { section: "WHY_SHOP", icon: "gift", title: "Giftable", body: "Thoughtful packaging, ready to give.", sortOrder: 2 },
      { section: "WHY_SHOP", icon: "shield", title: "Secure checkout", body: "Payments processed securely via Stripe.", sortOrder: 3 },
      { section: "WHY_SHOP", icon: "truck", title: "UK delivery", body: "Dispatched from the UK with tracking available.", sortOrder: 4 },
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
    { slug: "wax-melts", name: "Wax Melts", description: "Hand-poured wax melts in a range of fragrances.", sortOrder: 0 },
    { slug: "candles", name: "Candles", description: "Small-batch scented candles.", sortOrder: 1 },
    { slug: "gift-sets", name: "Gift Sets", description: "Curated gift sets, ready to give.", sortOrder: 2 },
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

  // --- Fragrances ---------------------------------------------------------
  const fragrances = [
    {
      slug: "vanilla-dream",
      name: "Vanilla Dream",
      description: "A warm, comforting blend of vanilla bean and soft musk.",
      scentFamily: "Sweet",
      topNotes: "Vanilla Bean, Caramel",
      heartNotes: "Sandalwood, Musk",
      baseNotes: "Tonka Bean",
    },
    {
      slug: "english-garden",
      name: "English Garden",
      description: "Fresh cut florals with a soft green undertone.",
      scentFamily: "Floral",
      topNotes: "Rose, Peony",
      heartNotes: "Jasmine, Green Leaves",
      baseNotes: "Soft Musk",
    },
    {
      slug: "citrus-grove",
      name: "Citrus Grove",
      description: "Zesty citrus with a clean, uplifting finish.",
      scentFamily: "Fresh",
      topNotes: "Lemon, Bergamot",
      heartNotes: "Orange Blossom",
      baseNotes: "White Musk",
    },
    {
      slug: "spiced-berry",
      name: "Spiced Berry",
      description: "Juicy berries warmed with a touch of spice.",
      scentFamily: "Fruity",
      topNotes: "Blackberry, Raspberry",
      heartNotes: "Cinnamon, Clove",
      baseNotes: "Amber",
      isSeasonal: true,
    },
    {
      slug: "cedar-and-oak",
      name: "Cedar & Oak",
      description: "Grounding woods with a hint of smoke.",
      scentFamily: "Woody",
      topNotes: "Cedarwood, Bergamot",
      heartNotes: "Oakmoss",
      baseNotes: "Vetiver, Amber",
    },
    {
      slug: "linen-fresh",
      name: "Linen Fresh",
      description: "Crisp, clean laundry-fresh fragrance.",
      scentFamily: "Clean",
      topNotes: "Aldehydes, Bergamot",
      heartNotes: "Cotton Flower",
      baseNotes: "White Musk",
    },
  ];
  const fragranceRecords: Record<string, string> = {};
  for (const frag of fragrances) {
    const record = await prisma.fragrance.upsert({
      where: { slug: frag.slug },
      update: {},
      create: frag,
    });
    fragranceRecords[frag.slug] = record.id;
  }

  // --- Products -----------------------------------------------------------
  const waxMeltProducts = [
    { slug: "vanilla-dream-wax-melt", name: "Vanilla Dream Wax Melt Snap Bar", fragrance: "vanilla-dream", bestSeller: true },
    { slug: "english-garden-wax-melt", name: "English Garden Wax Melt Snap Bar", fragrance: "english-garden", isNew: true },
    { slug: "citrus-grove-wax-melt", name: "Citrus Grove Wax Melt Snap Bar", fragrance: "citrus-grove" },
    { slug: "spiced-berry-wax-melt", name: "Spiced Berry Wax Melt Snap Bar", fragrance: "spiced-berry", seasonal: true },
  ];

  for (const [i, p] of waxMeltProducts.entries()) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        sku: `WM-${100 + i}`,
        name: p.name,
        status: "ACTIVE",
        productType: "WAX_MELT",
        categoryId: categoryRecords["wax-melts"],
        fragranceId: fragranceRecords[p.fragrance],
        shortDescription: "A hand-poured soy wax melt snap bar, ready to melt in your favourite warmer.",
        description:
          "[Placeholder description] Break off a piece and add to your wax warmer for hours of fragrance. Hand-poured in small batches.",
        price: 450,
        stockQuantity: 25,
        lowStockThreshold: 5,
        waxType: "Soy wax blend",
        meltFormat: "Snap Bar",
        piecesCount: 6,
        netWeightGrams: 50,
        recommendedUsage: "Snap off 1-2 cubes and place in a wax warmer with a tea light or electric burner.",
        storageGuidance: "Store in a cool, dry place away from direct sunlight.",
        safetyWarnings:
          "[Placeholder — replace with reviewed safety wording] Keep away from children and pets. Never leave a burning wax warmer unattended. Do not ingest.",
        featured: i === 0,
        bestSeller: Boolean(p.bestSeller),
        isNew: Boolean(p.isNew),
        seasonal: Boolean(p.seasonal),
        giftable: true,
      },
    });
  }

  const candleProducts = [
    { slug: "vanilla-dream-candle", name: "Vanilla Dream Candle", fragrance: "vanilla-dream", bestSeller: true },
    { slug: "cedar-oak-candle", name: "Cedar & Oak Candle", fragrance: "cedar-and-oak", isNew: true },
    { slug: "linen-fresh-candle", name: "Linen Fresh Candle", fragrance: "linen-fresh" },
  ];

  for (const [i, p] of candleProducts.entries()) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        sku: `CD-${200 + i}`,
        name: p.name,
        status: "ACTIVE",
        productType: "CANDLE",
        categoryId: categoryRecords["candles"],
        fragranceId: fragranceRecords[p.fragrance],
        shortDescription: "A hand-poured soy candle in a reusable glass vessel.",
        description:
          "[Placeholder description] Hand-poured in small batches using a cotton wick and soy wax blend.",
        price: 1650,
        stockQuantity: 15,
        lowStockThreshold: 3,
        waxType: "Soy wax blend",
        wickType: "Cotton wick",
        vesselInfo: "Reusable glass jar",
        candleWeightGrams: 200,
        vesselSize: "Medium (200g)",
        burnInstructions: "Trim wick to 5mm before each burn. Burn for no longer than 4 hours at a time.",
        candleCare: "Keep the wax pool free of debris and trim the wick between burns.",
        firstBurnInstructions: "On the first burn, allow the wax to melt to the edges of the jar (approx. 2-3 hours) to prevent tunnelling.",
        wickTrimmingGuidance: "Trim to 5mm before every burn using a wick trimmer or scissors.",
        maxBurnSessionHours: 4,
        burnTimeHours: 40,
        safetyWarnings:
          "[Placeholder — replace with reviewed safety wording] Never leave a burning candle unattended. Keep away from children, pets and flammable materials. Burn on a heat-resistant surface.",
        featured: i === 0,
        bestSeller: Boolean(p.bestSeller),
        isNew: Boolean(p.isNew),
        giftable: true,
      },
    });
  }

  const giftSet = await prisma.product.upsert({
    where: { slug: "cosy-nights-gift-set" },
    update: {},
    create: {
      slug: "cosy-nights-gift-set",
      sku: "GS-300",
      name: "Cosy Nights Gift Set",
      status: "ACTIVE",
      productType: "GIFT_SET",
      categoryId: categoryRecords["gift-sets"],
      shortDescription: "A candle and wax melt duo, gift-boxed and ready to give.",
      description: "[Placeholder description] A curated set pairing a full-size candle with a matching wax melt bar, presented in gift packaging.",
      price: 1950,
      stockQuantity: 10,
      lowStockThreshold: 2,
      giftPackagingAvailable: true,
      giftMessageEnabled: true,
      featured: true,
      giftable: true,
    },
  });

  const vanillaCandle = await prisma.product.findUnique({ where: { slug: "vanilla-dream-candle" } });
  const vanillaMelt = await prisma.product.findUnique({ where: { slug: "vanilla-dream-wax-melt" } });
  if (vanillaCandle && vanillaMelt) {
    await prisma.giftSetItem.deleteMany({ where: { giftSetId: giftSet.id } });
    await prisma.giftSetItem.createMany({
      data: [
        { giftSetId: giftSet.id, componentId: vanillaCandle.id, quantity: 1 },
        { giftSetId: giftSet.id, componentId: vanillaMelt.id, quantity: 1 },
      ],
    });
  }

  // --- FAQ ------------------------------------------------------------
  const faqCount = await prisma.faqItem.count();
  if (faqCount === 0) {
    await prisma.faqItem.createMany({
      data: [
        { category: "Wax Melts", question: "How do I use a wax melt?", answer: "Place one or two cubes into a wax warmer with a tea light or electric heating plate. Never add wax melts directly to an open flame.", sortOrder: 0 },
        { category: "Candle Care", question: "How long should I burn my candle for?", answer: "Burn for a maximum of 4 hours at a time, and always allow the wax to melt fully across the surface on the first burn.", sortOrder: 1 },
        { category: "Orders", question: "How long will my order take to arrive?", answer: "Orders are typically dispatched within 1-3 working days, with UK delivery taking 2-4 working days after dispatch.", sortOrder: 2 },
        { category: "Delivery", question: "Do you offer free delivery?", answer: "Yes — free UK delivery is available on orders over the threshold shown at checkout.", sortOrder: 3 },
        { category: "Returns", question: "Can I return my order?", answer: "See our Returns & Refunds policy for full details on eligibility and how to start a return.", sortOrder: 4 },
        { category: "Safety", question: "Are your products tested?", answer: "[Placeholder — replace once safety testing/compliance documentation is finalised.]", sortOrder: 5 },
      ],
    });
  }

  // --- Policies (draft placeholders — must be reviewed before launch) -----
  const policies = [
    { slug: "terms", title: "Terms & Conditions" },
    { slug: "privacy", title: "Privacy Policy" },
    { slug: "cookies", title: "Cookie Policy" },
    { slug: "delivery", title: "Delivery Policy" },
    { slug: "returns-refunds", title: "Returns & Refunds Policy" },
    { slug: "cancellation", title: "Cancellation Policy" },
    { slug: "complaints", title: "Complaints Policy" },
    { slug: "candle-safety", title: "Candle Safety" },
    { slug: "wax-melt-safety", title: "Wax Melt Safety" },
    { slug: "accessibility", title: "Accessibility Statement" },
  ];
  for (const policy of policies) {
    await prisma.policy.upsert({
      where: { slug: policy.slug },
      update: {},
      create: {
        slug: policy.slug,
        title: policy.title,
        body: `[DRAFT PLACEHOLDER] This is placeholder text for the ${policy.title}. Replace this with reviewed, accurate legal wording before launch. Do not treat this content as legally binding.`,
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
