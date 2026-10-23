/**
 * Checks that Stripe's product catalogue matches the shop, and fixes it.
 *
 * The shop database is the source of truth. For every product:
 * - live in the shop  -> must be an active Stripe Product with the same name,
 *   description and photo, and active GBP Prices for the same amounts
 *   (regular, sale, and any size with its own price);
 * - not live (draft / archived) -> its Stripe Product must be switched off.
 * Stripe Products that aren't linked to any shop product are reported as
 * "extra" but never touched: they may be used for payment links etc.
 *
 * Reading uses a handful of list calls (not one call per product), so the
 * check is quick. Fixing goes through lib/stripe-sync.ts, a few products at
 * a time, so no single request runs long.
 */
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { archiveProductInStripe, stripeProductDetails, syncProductToStripe } from "@/lib/stripe-sync";

export type CatalogueProblem = {
  productId: string;
  name: string;
  status: string;
  problems: string[];
  /** true when an amount is wrong or missing, so new Stripe Prices are needed */
  priceProblem: boolean;
};

export type CatalogueCheck = {
  configured: boolean;
  mode: "live" | "test" | "none";
  checked: number;
  matching: number;
  problems: CatalogueProblem[];
  extras: { id: string; name: string }[];
};

const gbp = (pence: number) => `£${(pence / 100).toFixed(2)}`;

async function listAll<T>(page: (startingAfter?: string) => Promise<Stripe.ApiList<T & { id: string }>>) {
  const out: (T & { id: string })[] = [];
  let after: string | undefined;
  for (;;) {
    const res = await page(after);
    out.push(...res.data);
    if (!res.has_more || res.data.length === 0) return out;
    after = res.data[res.data.length - 1].id;
  }
}

export async function checkStripeCatalogue(): Promise<CatalogueCheck> {
  const key = process.env.STRIPE_SECRET_KEY || "";
  const mode = !stripeConfigured() ? "none" : key.startsWith("sk_live") || key.startsWith("rk_live") ? "live" : "test";
  if (mode === "none") return { configured: false, mode, checked: 0, matching: 0, problems: [], extras: [] };

  const [products, sProducts, sPrices] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { variants: { select: { id: true, name: true, priceOverride: true, stripePriceId: true } } },
    }),
    listAll<Stripe.Product>((starting_after) => stripe.products.list({ limit: 100, starting_after })),
    listAll<Stripe.Price>((starting_after) => stripe.prices.list({ limit: 100, starting_after })),
  ]);
  const productById = new Map(sProducts.map((p) => [p.id, p]));
  const priceById = new Map(sPrices.map((p) => [p.id, p]));

  const problems: CatalogueProblem[] = [];
  let checked = 0;
  const linked = new Set<string>();

  for (const p of products) {
    if (p.stripeProductId) linked.add(p.stripeProductId);
    const sp = p.stripeProductId ? productById.get(p.stripeProductId) : undefined;
    const issues: string[] = [];
    let priceProblem = false;

    if (p.status !== "ACTIVE") {
      // Only products that were once sent to Stripe matter here.
      if (sp?.active) {
        checked++;
        problems.push({ productId: p.id, name: p.name, status: p.status, problems: ["Not on sale in the shop but still active in Stripe"], priceProblem: false });
      }
      continue;
    }
    checked++;

    if (!sp) {
      problems.push({ productId: p.id, name: p.name, status: p.status, problems: ["Not in Stripe yet"], priceProblem: true });
      continue;
    }

    const want = stripeProductDetails(p);
    if (!sp.active) issues.push("Switched off in Stripe");
    if (sp.name !== p.name) issues.push(`Name in Stripe is "${sp.name}"`);
    if ((sp.description ?? null) !== want.description) issues.push("Description differs");
    if (want.image && sp.images[0] !== want.image) issues.push(sp.images.length ? "Photo differs" : "No photo in Stripe");

    const checkPrice = (label: string, priceId: string | null, amount: number) => {
      const pr = priceId ? priceById.get(priceId) : undefined;
      if (!pr) {
        issues.push(`${label} price missing in Stripe`);
        priceProblem = true;
      } else if (!pr.active || pr.currency !== "gbp" || pr.unit_amount !== amount || pr.product !== sp.id) {
        const was = pr.unit_amount != null ? gbp(pr.unit_amount) : "unknown";
        issues.push(`${label} price is ${was}${pr.active ? "" : " (switched off)"} in Stripe, ${gbp(amount)} in shop`);
        priceProblem = true;
      }
    };

    checkPrice("Regular", p.stripePriceId, p.price);
    if (p.salePrice != null) checkPrice("Sale", p.stripeSalePriceId, p.salePrice);
    else if (p.stripeSalePriceId && priceById.get(p.stripeSalePriceId)?.active) {
      issues.push("Old sale price still active in Stripe");
      priceProblem = true;
    }
    for (const v of p.variants) {
      if (v.priceOverride != null) checkPrice(v.name, v.stripePriceId, v.priceOverride);
    }

    if (issues.length) problems.push({ productId: p.id, name: p.name, status: p.status, problems: issues, priceProblem });
  }

  const extras = sProducts
    .filter((sp) => sp.active && !linked.has(sp.id))
    .map((sp) => ({ id: sp.id, name: sp.name }));

  return { configured: true, mode, checked, matching: checked - problems.length, problems, extras };
}

/** Fixes one product found by checkStripeCatalogue. Returns an error message, or null on success. */
export async function fixStripeProduct(productId: string, priceProblem: boolean): Promise<string | null> {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { status: true, stripeProductId: true } });
  if (!product) return "Product not found";

  if (product.status !== "ACTIVE") {
    const res = await archiveProductInStripe(productId);
    return res.status === "FAILED" ? res.error ?? "Failed" : null;
  }

  // Linked to a Stripe Product that no longer exists (deleted in the
  // dashboard, or made with a different Stripe account) - start afresh.
  if (product.stripeProductId) {
    const exists = await stripe.products.retrieve(product.stripeProductId).then(
      (sp) => !("deleted" in sp && sp.deleted),
      () => false
    );
    if (!exists) {
      await prisma.$transaction([
        prisma.product.update({ where: { id: productId }, data: { stripeProductId: null, stripePriceId: null, stripeSalePriceId: null } }),
        prisma.productVariant.updateMany({ where: { productId }, data: { stripePriceId: null } }),
      ]);
    }
  }

  const res = await syncProductToStripe(productId, { priceChanged: priceProblem, detailsChanged: true });
  return res.status === "SYNCED" ? null : res.error ?? "Not synced";
}
