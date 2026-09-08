"use server";

/**
 * Admin-only, explicitly-triggered catalogue sync. Nothing in this file is
 * ever called automatically (no cron, no auto-run on save/boot) — the store
 * owner decides when the existing catalogue is sent to the Stripe sandbox by
 * clicking "Sync Catalogue to Stripe" in Admin -> Products.
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { syncProductToStripe } from "@/lib/stripe-sync";

export type StripeCatalogueSummary = {
  totalSellable: number;
  synced: number;
  needsSync: number;
};

/** Read-only preview — "how many products need syncing" — never mutates anything. */
export async function getStripeCatalogueSummary(): Promise<StripeCatalogueSummary> {
  await requireAdminSession();

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
  await requireAdminSession();

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
