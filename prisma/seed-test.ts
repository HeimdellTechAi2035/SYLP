// Deterministic fixtures for the automated test suite ONLY.
// Intentionally separate from prisma/seed.ts (the dev sample catalog) so test
// runs never depend on — or risk corrupting — the developer's seeded data.
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl.includes("test.db")) {
  throw new Error(`Refusing to seed — DATABASE_URL does not point at a test.db file: ${dbUrl}`);
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "test-admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "TestPassword123!";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10), name: "Test Admin", role: "OWNER" },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { freeDeliveryThreshold: 3000, standardDeliveryPrice: 295 },
    create: { id: 1, businessName: "HandMade by Mia (Test)", freeDeliveryThreshold: 3000, standardDeliveryPrice: 295 },
  });

  await prisma.deliveryZone.deleteMany({});
  await prisma.deliveryZone.create({
    data: { name: "Test UK Zone", countries: "United Kingdom", price: 295, freeThreshold: 3000, estimatedDays: "2-4 working days", isActive: true },
  });

  const category = await prisma.category.upsert({
    where: { slug: "test-wax-melts" },
    update: {},
    create: { slug: "test-wax-melts", name: "Test Wax Melts", isActive: true },
  });

  const fragrance = await prisma.fragrance.upsert({
    where: { slug: "test-fragrance" },
    update: {},
    create: { slug: "test-fragrance", name: "Test Fragrance", scentFamily: "Fresh", isActive: true },
  });

  const products: Record<string, string> = {};

  const productDefs: Array<{
    slug: string;
    name: string;
    price: number;
    stockQuantity: number;
    salePrice?: number;
    saleActive?: boolean;
    continueSellingOOS?: boolean;
    madeToOrder?: boolean;
    productionTimeDays?: number;
    status?: string;
  }> = [
    { slug: "test-melt-standard", name: "Test Melt Standard", price: 500, stockQuantity: 10 },
    { slug: "test-melt-sale", name: "Test Melt On Sale", price: 1000, salePrice: 700, saleActive: true, stockQuantity: 10 },
    { slug: "test-melt-oos", name: "Test Melt Out Of Stock", price: 500, stockQuantity: 0 },
    { slug: "test-melt-continue", name: "Test Melt Continue Selling", price: 500, stockQuantity: 0, continueSellingOOS: true },
    { slug: "test-melt-mto", name: "Test Melt Made To Order", price: 500, stockQuantity: 0, madeToOrder: true, productionTimeDays: 3 },
    { slug: "test-draft-product", name: "Test Draft Product", price: 500, stockQuantity: 10, status: "DRAFT" },
  ];

  for (const def of productDefs) {
    const product = await prisma.product.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        slug: def.slug,
        sku: `TESTSKU-${def.slug}`,
        name: def.name,
        status: def.status ?? "ACTIVE",
        productType: "WAX_MELT",
        categoryId: category.id,
        fragranceId: fragrance.id,
        price: def.price,
        salePrice: def.salePrice ?? null,
        saleActive: def.saleActive ?? false,
        stockQuantity: def.stockQuantity,
        continueSellingOOS: def.continueSellingOOS ?? false,
        madeToOrder: def.madeToOrder ?? false,
        productionTimeDays: def.productionTimeDays ?? null,
      },
    });
    products[def.slug] = product.id;
  }

  const variantProduct = await prisma.product.upsert({
    where: { slug: "test-candle-variant" },
    update: {},
    create: {
      slug: "test-candle-variant",
      sku: "TESTSKU-candle-variant",
      name: "Test Candle With Variant",
      status: "ACTIVE",
      productType: "CANDLE",
      categoryId: category.id,
      fragranceId: fragrance.id,
      price: 1500,
      stockQuantity: 20,
    },
  });
  products["test-candle-variant"] = variantProduct.id;

  await prisma.productVariant.upsert({
    where: { sku: "TESTVAR-1" },
    update: {},
    create: {
      productId: variantProduct.id,
      name: "Test Candle — Large",
      sku: "TESTVAR-1",
      priceOverride: 1800,
      stockQuantity: 5,
      isDefault: true,
    },
  });

  // --- Discounts covering every rule branch in lib/discounts.ts ---
  const discountDefs: Array<{
    code: string;
    type: string;
    value: number;
    minimumSpend?: number;
    maxUses?: number;
    perCustomerLimit?: number;
    startDate?: Date;
    endDate?: Date;
    timesUsed?: number;
    isActive?: boolean;
  }> = [
    { code: "TESTSAVE10", type: "PERCENTAGE", value: 10 },
    { code: "TESTFIXED5", type: "FIXED", value: 500 },
    { code: "TESTMINSPEND", type: "PERCENTAGE", value: 20, minimumSpend: 5000 },
    { code: "TESTINACTIVE", type: "PERCENTAGE", value: 10, isActive: false },
    { code: "TESTEXPIRED", type: "PERCENTAGE", value: 10, endDate: new Date("2020-01-01") },
    { code: "TESTFUTURE", type: "PERCENTAGE", value: 10, startDate: new Date("2099-01-01") },
    { code: "TESTMAXUSES", type: "PERCENTAGE", value: 10, maxUses: 1, timesUsed: 1 },
    { code: "TESTPERCUSTOMER", type: "PERCENTAGE", value: 10, perCustomerLimit: 1 },
  ];

  for (const def of discountDefs) {
    await prisma.discount.upsert({
      where: { code: def.code },
      update: {},
      create: {
        code: def.code,
        type: def.type,
        value: def.value,
        minimumSpend: def.minimumSpend ?? null,
        maxUses: def.maxUses ?? null,
        perCustomerLimit: def.perCustomerLimit ?? null,
        startDate: def.startDate ?? null,
        endDate: def.endDate ?? null,
        timesUsed: def.timesUsed ?? 0,
        isActive: def.isActive ?? true,
      },
    });
  }

  // --- Customers + an order, for account isolation / order-tracking tests ---
  const customerA = await prisma.customer.upsert({
    where: { email: "existing-customer@example.com" },
    update: {},
    create: {
      email: "existing-customer@example.com",
      firstName: "Existing",
      lastName: "Customer",
      passwordHash: await bcrypt.hash("ExistingPass123!", 10),
    },
  });

  await prisma.customer.upsert({
    where: { email: "other-customer@example.com" },
    update: {},
    create: {
      email: "other-customer@example.com",
      firstName: "Other",
      lastName: "Customer",
      passwordHash: await bcrypt.hash("OtherPass123!", 10),
    },
  });

  const existingOrder = await prisma.order.upsert({
    where: { orderNumber: "HM-TEST1001" },
    update: {},
    create: {
      orderNumber: "HM-TEST1001",
      customerId: customerA.id,
      email: customerA.email,
      firstName: "Existing",
      lastName: "Customer",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "SW1A 1AA",
      subtotal: 500,
      deliveryAmount: 295,
      total: 795,
      paymentStatus: "PAID",
      fulfilmentStatus: "PAID",
    },
  });

  const existingOrderItem = await prisma.orderItem.findFirst({ where: { orderId: existingOrder.id } });
  if (!existingOrderItem) {
    await prisma.orderItem.create({
      data: {
        orderId: existingOrder.id,
        productId: products["test-melt-standard"],
        productName: "Test Melt Standard",
        unitPrice: 500,
        quantity: 1,
        lineTotal: 500,
      },
    });
  }

  // An order that has already used TESTPERCUSTOMER, for the per-customer-limit test.
  const perCustomerOrder = await prisma.order.upsert({
    where: { orderNumber: "HM-TEST1002" },
    update: {},
    create: {
      orderNumber: "HM-TEST1002",
      email: "used-discount@example.com",
      firstName: "Used",
      lastName: "Discount",
      shippingLine1: "2 Test Street",
      shippingCity: "London",
      shippingPostcode: "SW1A 1AA",
      subtotal: 500,
      discountCode: "TESTPERCUSTOMER",
      discountAmount: 50,
      deliveryAmount: 295,
      total: 745,
      paymentStatus: "PAID",
      fulfilmentStatus: "PAID",
    },
  });
  void perCustomerOrder;

  console.log("Test fixtures seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
