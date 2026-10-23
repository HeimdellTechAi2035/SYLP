/**
 * Gives a division its own copy of the product range, copied from another
 * division ("the template"): same products, prices, sizes and gift-set
 * contents, renamed for the new division, with the new crest printed on
 * the hoodie and t-shirt photos. Then sends each product to Stripe.
 *
 * Safe to run again: products the division already has are skipped, so
 * it can be used to fill in anything missing.
 */
import { prisma } from "@/lib/prisma";
import { syncProductToStripe } from "@/lib/stripe-sync";
import { makeApparelPhoto, type ApparelKind } from "@/lib/division-art";

export type RangeResult = { created: string[]; skipped: string[]; stripeFailed: string[]; photoFailed: string[] };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "Blackpool Patriots" -> "BLA"; falls back to letters from the slug. */
function skuPrefix(name: string) {
  const letters = name.replace(/patriots?/gi, "").replace(/[^a-z]/gi, "").toUpperCase();
  return (letters.slice(0, 3) || "DIV").padEnd(3, "X");
}

async function uniqueValue(base: string, taken: (v: string) => Promise<boolean>) {
  let v = base;
  for (let i = 2; await taken(v); i++) v = `${base}-${i}`;
  return v;
}

export async function setupDivisionRange(
  divisionId: string,
  templateDivisionId: string,
  opts: { live?: boolean } = {}
): Promise<RangeResult> {
  const result: RangeResult = { created: [], skipped: [], stripeFailed: [], photoFailed: [] };
  const [division, template] = await Promise.all([
    prisma.division.findUnique({ where: { id: divisionId }, include: { products: { select: { id: true, slug: true } } } }),
    prisma.division.findUnique({ where: { id: templateDivisionId } }),
  ]);
  if (!division || !template || division.id === template.id) return result;

  const source = await prisma.product.findMany({
    where: { divisionId: template.id, status: "ACTIVE" },
    include: { variants: { orderBy: { sortOrder: "asc" } }, images: { orderBy: { sortOrder: "asc" } }, giftSetItems: true },
    orderBy: { createdAt: "asc" },
  });

  const nameRe = new RegExp(escapeRe(template.name), "gi");
  const hasName = new RegExp(escapeRe(template.name), "i");
  const rename = (s: string | null) => (s == null ? s : s.replace(nameRe, division.name));
  // "preston-patriots-hoodie" -> "hoodie", so products can be matched up across divisions
  const keyFor = (slug: string, d: { slug: string }) => (slug.startsWith(`${d.slug}-`) ? slug.slice(d.slug.length + 1) : slug);
  const existing = new Map(division.products.map((p) => [keyFor(p.slug, division), p.id]));
  const prefix = skuPrefix(division.name);

  const idMap = new Map<string, string>(); // template product id -> this division's product id
  const newIds: string[] = [];
  const apparelPhotos = new Map<ApparelKind, string | null>();

  for (const p of source) {
    const key = keyFor(p.slug, template);
    const already = existing.get(key);
    if (already) {
      result.skipped.push(p.name);
      idMap.set(p.id, already);
      continue;
    }

    const slug = await uniqueValue(`${division.slug}-${key}`, async (v) => Boolean(await prisma.product.findUnique({ where: { slug: v }, select: { id: true } })));
    const tail = p.sku.includes("-") ? p.sku.slice(p.sku.indexOf("-") + 1) : p.sku;
    const sku = await uniqueValue(`${prefix}-${tail}`, async (v) => Boolean(await prisma.product.findUnique({ where: { sku: v }, select: { id: true } })));
    const name = hasName.test(p.name) ? rename(p.name)! : `${division.name} ${p.name}`;

    // Hoodie and t-shirt get the new crest printed on; everything else keeps the template photo.
    const kind: ApparelKind | null = key === "hoodie" ? "hoodie" : key === "t-shirt" ? "t-shirt" : null;
    // Anywhere the template division's own crest is used as a photo, use the new crest instead.
    const swapCrest = (url: string | null) => (url && template.image && url === template.image && division.image ? division.image : url);
    let mainImage = swapCrest(p.mainImage);
    if (kind) {
      if (!apparelPhotos.has(kind)) apparelPhotos.set(kind, await makeApparelPhoto(kind, division.image).catch(() => null));
      const photo = apparelPhotos.get(kind);
      if (photo) mainImage = photo;
      else result.photoFailed.push(name);
    }

    const created = await prisma.product.create({
      data: {
        slug,
        sku,
        name,
        status: opts.live === false ? "DRAFT" : "ACTIVE",
        productType: p.productType,
        categoryId: p.categoryId,
        divisionId: division.id,
        shortDescription: rename(p.shortDescription),
        description: rename(p.description),
        price: p.price,
        salePrice: p.salePrice,
        costPrice: p.costPrice,
        saleActive: p.saleActive,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
        continueSellingOOS: p.continueSellingOOS,
        madeToOrder: p.madeToOrder,
        productionTimeDays: p.productionTimeDays,
        packagingProfileId: p.packagingProfileId,
        mainImage,
        videoUrl: p.videoUrl,
        material: p.material,
        careInstructions: p.careInstructions,
        netWeightGrams: p.netWeightGrams,
        dimensions: p.dimensions,
        safetyWarnings: p.safetyWarnings,
        supplierManufacturerDetails: p.supplierManufacturerDetails,
        featured: p.featured,
        bestSeller: false,
        isNew: p.isNew,
        seasonal: p.seasonal,
        giftable: p.giftable,
        giftPackagingAvailable: p.giftPackagingAvailable,
        giftMessageEnabled: p.giftMessageEnabled,
        seoTitle: rename(p.seoTitle),
        metaDescription: rename(p.metaDescription),
        images: {
          create: p.images
            .filter((img) => img.url !== p.mainImage || !kind)
            .map((img) => ({ url: swapCrest(img.url)!, altText: rename(img.altText), sortOrder: img.sortOrder })),
        },
        variants: {
          create: p.variants.map((v, i) => ({
            name: rename(v.name)!,
            size: v.size,
            colour: v.colour,
            packSize: v.packSize,
            isGiftOption: v.isGiftOption,
            sku: `${sku}-${v.size ? v.size.toUpperCase().replace(/[^A-Z0-9]/g, "") : i + 1}`,
            priceOverride: v.priceOverride,
            stockQuantity: v.stockQuantity,
            isDefault: v.isDefault,
            sortOrder: v.sortOrder,
            packagingProfileId: v.packagingProfileId,
          })),
        },
      },
    });
    idMap.set(p.id, created.id);
    newIds.push(created.id);
    result.created.push(created.name);
  }

  // Gift sets: point at this division's own copies of the items inside.
  for (const p of source) {
    const newId = idMap.get(p.id);
    if (!newId || !newIds.includes(newId) || !p.giftSetItems.length) continue;
    await prisma.giftSetItem.createMany({
      data: p.giftSetItems.map((g) => ({ giftSetId: newId, componentId: idMap.get(g.componentId) ?? g.componentId, quantity: g.quantity })),
    });
  }

  // Send the new products to Stripe, one at a time.
  if (opts.live !== false) {
    const created = await prisma.product.findMany({ where: { id: { in: newIds } }, select: { id: true, name: true } });
    for (const c of created) {
      const res = await syncProductToStripe(c.id, { priceChanged: true, detailsChanged: true });
      if (res.status === "FAILED") result.stripeFailed.push(c.name);
    }
  }

  return result;
}

/** Reprints the crest on a division's hoodie and t-shirt (e.g. after a new logo is uploaded). */
export async function refreshDivisionApparelPhotos(divisionId: string): Promise<number> {
  const division = await prisma.division.findUnique({ where: { id: divisionId } });
  if (!division?.image) return 0;
  let updated = 0;
  for (const kind of ["hoodie", "t-shirt"] as const) {
    const product = await prisma.product.findUnique({ where: { slug: `${division.slug}-${kind}` } });
    if (!product || product.divisionId !== division.id) continue;
    const photo = await makeApparelPhoto(kind, division.image).catch(() => null);
    if (!photo) continue;
    await prisma.product.update({ where: { id: product.id }, data: { mainImage: photo } });
    if (product.status === "ACTIVE") await syncProductToStripe(product.id, { detailsChanged: true });
    updated++;
  }
  return updated;
}
