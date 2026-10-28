"use server";

/**
 * Admin-only, explicitly-triggered catalogue sync. Nothing in this file is
 * ever called automatically (no cron, no auto-run on save/boot) — the store
 * owner decides when the existing catalogue is sent to the Stripe sandbox by
 * clicking "Sync Catalogue to Stripe" in Admin -> Products.
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/auth";
import { syncProductToStripe } from "@/lib/stripe-sync";
import { checkStripeCatalogue, fixStripeProduct } from "@/lib/stripe-reconcile";

export type StripeCatalogueSummary = {
  totalSellable: number;
  synced: number;
  needsSync: number;
};

/** Read-only preview — "how many products need syncing" — never mutates anything. */
export async function getStripeCatalogueSummary(): Promise<StripeCatalogueSummary> {
  await requireOwnerSession();

  const [totalSellable, synced] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "ACTIVE", stripeSyncStatus: "SYNCED" } }),
  ]);

  return { totalSellable, synced, needsSync: totalSellable - synced };
}

export type BulkSyncResult = { attempted: number; synced: number; failed: number; failedProductNames: string[] };

/**
 * Syncs every currently-unsynced published product, one at a time (never in
 * parallel — avoids bursting the Stripe API). Restartable: since
 * syncProductToStripe is idempotent per product, running this again after a
 * partial failure only retries the ones still not SYNCED, never duplicates
 * an already-created Stripe Product/Price.
 */
export async function bulkSyncCatalogueToStripe(): Promise<BulkSyncResult> {
  await requireOwnerSession();

  const pending = await prisma.product.findMany({
    where: { status: "ACTIVE", stripeSyncStatus: { not: "SYNCED" } },
    select: { id: true, name: true },
  });

  let synced = 0;
  const failedProductNames: string[] = [];

  for (const product of pending) {
    const result = await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });
    if (result.status === "SYNCED") {
      synced += 1;
    } else if (result.status === "FAILED") {
      failedProductNames.push(product.name);
    }
  }

  revalidatePath("/admin/products");

  return { attempted: pending.length, synced, failed: failedProductNames.length, failedProductNames };
}

/** Compare every product in the shop with what Stripe holds. Read-only. */
export async function checkStripeCatalogueAction() {
  await requireOwnerSession();
  return checkStripeCatalogue();
}

/**
 * Fix a few products at a time (the panel calls this repeatedly), so no
 * single request runs long. Each product is re-read from the database, so
 * the client only chooses which products, never what gets written.
 */
export async function fixStripeCatalogueBatch(
  items: { productId: string; priceProblem: boolean }[]
): Promise<{ fixed: string[]; failed: { productId: string; error: string }[] }> {
  await requireOwnerSession();
  const fixed: string[] = [];
  const failed: { productId: string; error: string }[] = [];
  for (const item of items.slice(0, 5)) {
    const error = await fixStripeProduct(String(item.productId), Boolean(item.priceProblem));
    if (error) failed.push({ productId: item.productId, error });
    else fixed.push(item.productId);
  }
  revalidatePath("/admin/products");
  return { fixed, failed };
}
