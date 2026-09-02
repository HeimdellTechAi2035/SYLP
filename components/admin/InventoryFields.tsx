"use client";

import { useState } from "react";
import { FormField, FormCheckbox } from "@/components/admin/FormField";

/**
 * Most HandMade by Mia products are made to order — stock is effectively
 * unlimited because Mia makes more as orders arrive. Rather than making
 * admins type an artificial number like 9999 for those, this only asks for
 * a stock quantity at all once "Track stock quantity" is switched on.
 */
export default function InventoryFields({
  trackStock: initialTrackStock,
  stockQuantity,
  lowStockThreshold,
  continueSellingOOS,
}: {
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  continueSellingOOS: boolean;
}) {
  const [trackStock, setTrackStock] = useState(initialTrackStock);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="trackStock"
          checked={trackStock}
          onChange={(e) => setTrackStock(e.target.checked)}
          className="rounded border-ink/30"
        />
        Track stock quantity
      </label>

      {trackStock ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Stock quantity" name="stockQuantity" type="number" min="0" defaultValue={stockQuantity} required />
          <FormField label="Low stock threshold" name="lowStockThreshold" type="number" min="0" defaultValue={lowStockThreshold} required />
          <div className="sm:col-span-2">
            <FormCheckbox label="Continue selling when out of stock" name="continueSellingOOS" defaultChecked={continueSellingOOS} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-sage font-medium">Made to order / Unlimited — no stock number needed.</p>
      )}
    </div>
  );
}
