"use client";

import { useState, useTransition } from "react";
import { bulkSyncCatalogueToStripe, type BulkSyncResult } from "@/lib/actions/admin/stripe-catalogue-sync";

/**
 * Explicit, admin-triggered only — this never runs on page load, on save, or
 * on any schedule. The store owner decides when the existing catalogue is
 * sent to the Stripe sandbox by clicking the button below.
 */
export default function StripeCatalogueSyncPanel({
  totalSellable,
  needsSync,
}: {
  totalSellable: number;
  needsSync: number;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<BulkSyncResult | null>(null);

  if (needsSync === 0) {
    return (
      <div className="bg-sage/10 text-sage rounded-xl p-4 mb-6 text-sm">
        All {totalSellable} published product{totalSellable === 1 ? "" : "s"} {totalSellable === 1 ? "is" : "are"} synced to Stripe.
      </div>
    );
  }

  return (
    <div className="bg-gold/10 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm">
          <strong>{needsSync}</strong> of {totalSellable} published product{totalSellable === 1 ? "" : "s"} need{needsSync === 1 ? "s" : ""} to be sent to the Stripe sandbox catalogue.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setResult(null);
            startTransition(async () => {
              const res = await bulkSyncCatalogueToStripe();
              setResult(res);
            });
          }}
          className="px-5 py-2 rounded-full bg-rose-dark text-ink text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Syncing..." : "Sync Catalogue to Stripe"}
        </button>
      </div>
      {result && (
        <p className="text-sm mt-3">
          Attempted {result.attempted} · Synced {result.synced} · Failed {result.failed}
          {result.failed > 0 && ` (${result.failedProductNames.join(", ")})`}
        </p>
      )}
    </div>
  );
}
