/**
 * Mirrors the local product catalogue into Stripe (sandbox/test mode) so an
 * admin never has to manually recreate a product in the Stripe Dashboard.
 *
 * Stripe is a DOWNSTREAM payment catalogue here, never the source of truth:
 * this module only ever reads local Product/Variant rows and pushes them
 * outward. Nothing here decides stock, availability, or what checkout
 * charges — see lib/actions/checkout.ts, which still computes and charges
 * the price via lib/pricing.ts's unitPriceFor() directly, independent of
 * whatever's mirrored here. That is a deliberate choice, not an oversight —
 * see the "why checkout doesn't use these Price IDs" note near the bottom of
 * this file.
 *
 * Design:
 * - One local Product -> one Stripe Product (stripeProductId).
 * - A product's own regular/sale prices -> up to two Stripe Prices
 *   (stripePriceId / stripeSalePriceId on Product).
 * - A variant with its OWN priceOverride -> its own Stripe Price
 *   (stripePriceId on ProductVariant). A variant WITHOUT an override has no
 *   Stripe Price of its own — it inherits the product's, exactly as
 *   lib/pricing.ts's unitPriceFor() already treats it for checkout purposes.
 * - Stripe Prices are immutable in amount: a "price change" always means
 *   creating a new Price, swapping the stored id to point at it, and
 *   deactivating the old one — never mutating an existing Price's amount.
 * - Every step writes its result to the database immediately, so a crash or
 *   API failure partway through leaves enough state for the next sync
 *   attempt to resume from exactly where it stopped, rather than redoing
 *   (and duplicating) work that already succeeded.
 */
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import type { Product } from "@prisma/client";

export type StripeSyncResult = { status: "SYNCED" | "FAILED" | "NOT_SYNCED"; error?: string };

/**
 * Stripe will happily store a localhost/127.0.0.1/relative image URL, but it
 * can never actually fetch it — and Stripe's own dashboard/checkout would
 * then show a broken image. Only pass through a URL Stripe could plausibly
 * reach itself.
 */
export function isPubliclyReachableImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local")) return false;
    return true;
  } catch {
    return false; // not an absolute URL at all (e.g. a relative /uploads/... path)
  }
}

/** Never let a Stripe error string leak into anything admin-visible beyond a short, safe summary. */
function sanitizeStripeError(err: unknown): string {
  const message = err instanceof Error ? err.message : "Unknown error";
  // Stripe SDK error messages describe the API problem (e.g. "No such price"),
  // never the secret key itself — but cap length and strip defensively anyway.
  return message.replace(/sk_(live|test)_[a-zA-Z0-9]+/g, "[redacted]").slice(0, 500);
}

function isSellableStatus(status: string): boolean {
  return status === "ACTIVE";
}

async function markSyncing(productId: string) {
  await prisma.product.update({ where: { id: productId }, data: { stripeSyncStatus: "PENDING", stripeSyncError: null } });
}

async function markSynced(productId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { stripeSyncStatus: "SYNCED", stripeSyncedAt: new Date(), stripeSyncError: null },
  });
}

async function markFailed(productId: string, err: unknown) {
  await prisma.product
    .update({ where: { id: productId }, data: { stripeSyncStatus: "FAILED", stripeSyncError: sanitizeStripeError(err) } })
    .catch(() => {});
}

/**
 * Publishes/updates a product (and, where relevant, its price-overriding
 * variants) to Stripe. Safe to call repeatedly — every step is idempotent.
 *
 * `priceChanged` / `detailsChanged` let the caller (an admin action that
 * already has the before/after values from its own update) tell this
 * function what actually needs reconciling, without this module needing to
 * cache a duplicate copy of "the price Stripe last saw" just to detect drift.
 */
export async function syncProductToStripe(
  productId: string,
  options: { priceChanged?: boolean; detailsChanged?: boolean } = {}
): Promise<StripeSyncResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) return { status: "FAILED", error: "Product not found" };

  if (!isSellableStatus(product.status)) {
    // Draft (never published) or archived — nothing to push yet/anymore.
    // Archiving an already-synced product is handled by archiveProductInStripe.
    return { status: "NOT_SYNCED" };
  }

  if (!stripeConfigured()) {
    // Legitimate local-dev state (placeholder keys) — not an error, just not attempted.
    return { status: "NOT_SYNCED" };
  }

  const isFirstSync = !product.stripeProductId;

  try {
    await markSyncing(productId);

    const stripeProductId = await ensureStripeProduct(product);
    const { stripePriceId, stripeSalePriceId } = await ensureProductPrices(
      { ...product, stripeProductId },
      isFirstSync || Boolean(options.priceChanged)
    );

    await prisma.product.update({
      where: { id: productId },
      data: { stripeProductId, stripePriceId, stripeSalePriceId },
    });

    // Variants with their own priceOverride get their own Price; others
    // inherit the product's, so there's nothing further to do for them here.
    for (const variant of product.variants) {
      if (variant.priceOverride != null) {
        await syncVariantToStripe(variant.id, { forceReprice: isFirstSync || Boolean(options.priceChanged) });
      }
    }

    await markSynced(productId);
    return { status: "SYNCED" };
  } catch (err) {
    await markFailed(productId, err);
    return { status: "FAILED", error: sanitizeStripeError(err) };
  }
}

async function ensureStripeProduct(product: Product): Promise<string> {
  const image = isPubliclyReachableImageUrl(product.mainImage) ? [product.mainImage] : undefined;
  const description = (product.shortDescription || product.description || undefined)?.slice(0, 500);

  if (!product.stripeProductId) {
    const created = await stripe.products.create({
      name: product.name,
      description,
      images: image,
      metadata: { localProductId: product.id, sku: product.sku },
    });
    return created.id;
  }

  // Already exists — update in place. Never create a second Stripe Product
  // just because the name/description/image changed.
  await stripe.products.update(product.stripeProductId, {
    name: product.name,
    description,
    images: image,
  });
  return product.stripeProductId;
}

async function ensureProductPrices(
  product: Product & { stripeProductId: string },
  forceReprice: boolean
): Promise<{ stripePriceId: string; stripeSalePriceId: string | null }> {
  let stripePriceId = product.stripePriceId;
  if (!stripePriceId || forceReprice) {
    const created = await stripe.prices.create({
      product: product.stripeProductId,
      currency: "gbp",
      unit_amount: product.price,
      nickname: `${product.name} — regular`,
      metadata: { localProductId: product.id, sku: product.sku, kind: "regular" },
    });
    if (stripePriceId && stripePriceId !== created.id) {
      await stripe.prices.update(stripePriceId, { active: false }).catch(() => {});
    }
    stripePriceId = created.id;
  }

  let stripeSalePriceId = product.stripeSalePriceId;
  if (product.salePrice != null) {
    if (!stripeSalePriceId || forceReprice) {
      const created = await stripe.prices.create({
        product: product.stripeProductId,
        currency: "gbp",
        unit_amount: product.salePrice,
        nickname: `${product.name} — sale`,
        metadata: { localProductId: product.id, sku: product.sku, kind: "sale" },
      });
      if (stripeSalePriceId && stripeSalePriceId !== created.id) {
        await stripe.prices.update(stripeSalePriceId, { active: false }).catch(() => {});
      }
      stripeSalePriceId = created.id;
    }
  } else if (stripeSalePriceId) {
    // Sale price removed entirely — retire the Stripe Price, don't leave it live.
    await stripe.prices.update(stripeSalePriceId, { active: false }).catch(() => {});
    stripeSalePriceId = null;
  }

  return { stripePriceId, stripeSalePriceId };
}

/** Only meaningful for a variant with its own priceOverride — see the module comment. */
export async function syncVariantToStripe(
  variantId: string,
  options: { forceReprice?: boolean } = {}
): Promise<StripeSyncResult> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant) return { status: "FAILED", error: "Variant not found" };
  if (variant.priceOverride == null) return { status: "NOT_SYNCED" };
  if (!isSellableStatus(variant.product.status)) return { status: "NOT_SYNCED" };
  if (!stripeConfigured()) return { status: "NOT_SYNCED" };

  try {
    const stripeProductId = await ensureStripeProduct(variant.product);
    if (stripeProductId !== variant.product.stripeProductId) {
      await prisma.product.update({ where: { id: variant.productId }, data: { stripeProductId } });
    }

    let stripePriceId = variant.stripePriceId;
    if (!stripePriceId || options.forceReprice) {
      const created = await stripe.prices.create({
        product: stripeProductId,
        currency: "gbp",
        unit_amount: variant.priceOverride,
        nickname: `${variant.product.name} — ${variant.name}`,
        metadata: {
          localProductId: variant.productId,
          localVariantId: variant.id,
          sku: variant.sku,
          size: variant.size ?? "",
        },
      });
      if (stripePriceId && stripePriceId !== created.id) {
        await stripe.prices.update(stripePriceId, { active: false }).catch(() => {});
      }
      stripePriceId = created.id;
      await prisma.productVariant.update({ where: { id: variantId }, data: { stripePriceId } });
    }

    return { status: "SYNCED" };
  } catch (err) {
    return { status: "FAILED", error: sanitizeStripeError(err) };
  }
}

/**
 * Archiving must never delete a Stripe object that might be tied to
 * historical payment history — only deactivate, so it drops out of any
 * future Stripe-side listing/checkout but existing Charges/Sessions that
 * reference it remain fully intact.
 */
export async function archiveProductInStripe(productId: string): Promise<StripeSyncResult> {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
  if (!product) return { status: "FAILED", error: "Product not found" };
  if (!stripeConfigured() || !product.stripeProductId) return { status: "NOT_SYNCED" };

  try {
    await stripe.products.update(product.stripeProductId, { active: false });
    if (product.stripePriceId) await stripe.prices.update(product.stripePriceId, { active: false }).catch(() => {});
    if (product.stripeSalePriceId) await stripe.prices.update(product.stripeSalePriceId, { active: false }).catch(() => {});
    for (const variant of product.variants) {
      if (variant.stripePriceId) await stripe.prices.update(variant.stripePriceId, { active: false }).catch(() => {});
    }
    return { status: "SYNCED" };
  } catch (err) {
    return { status: "FAILED", error: sanitizeStripeError(err) };
  }
}

/** Deactivates a single variant's Stripe Price (e.g. the variant itself was removed). */
export async function deactivateVariantInStripe(variantId: string): Promise<void> {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant?.stripePriceId || !stripeConfigured()) return;
  await stripe.prices.update(variant.stripePriceId, { active: false }).catch(() => {});
}

// --- Why checkout still uses inline price_data instead of these Price IDs ---
//
// lib/actions/checkout.ts builds Stripe Checkout line items with price_data
// computed fresh from unitPriceFor() on every request, rather than
// referencing stripePriceId/stripeSalePriceId here. That's deliberate:
//
// - It guarantees zero drift between "what the database says this costs
//   right now" and "what Stripe actually charges" — there's no window where
//   a stored Price ID could point at a stale amount.
// - Using a stored Price ID safely would require an extra live Stripe API
//   call per checkout item (retrieve the Price, compare its unit_amount to
//   the current local price, fail safely on any mismatch) — genuine added
//   complexity and a new external-call failure mode on the most
//   money-sensitive path in the app, for a mechanism whose only purpose here
//   is keeping the Stripe Dashboard's catalogue view accurate, not charging
//   correctly (checkout was already provably correct and fully tested
//   without it).
// - This module's Price objects exist so the Stripe Dashboard shows a
//   correct, browsable catalogue an admin never has to hand-create — not to
//   drive the charge itself. If/when embedded Stripe Elements replaces the
//   hosted Checkout redirect, revisit this: that flow needs a Price/amount
//   up front before the server-side recalculation this app already does.
