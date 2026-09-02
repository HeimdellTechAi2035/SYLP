import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import { createDeliveryZone, updateDeliveryZone, deleteDeliveryZone } from "@/lib/actions/admin/delivery";

export default async function AdminDeliveryPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Delivery" />
      <p className="text-sm text-ink-soft mb-6">
        Delivery pricing and free-delivery thresholds shown on the storefront (basket, checkout, product pages) come entirely from these zones.
      </p>

      <div className="space-y-4 mb-10">
        {zones.map((zone) => {
          const bound = updateDeliveryZone.bind(null, zone.id);
          return (
            <details key={zone.id} className="bg-white rounded-xl p-4">
              <summary className="cursor-pointer font-medium flex justify-between items-center">
                {zone.name}
                <span className="text-xs text-ink-soft">{formatPence(zone.price)}</span>
              </summary>
              <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                <input type="hidden" name="zoneId" value={zone.id} />
                <FormField label="Zone name" name="name" id={`zone-${zone.id}-name`} defaultValue={zone.name} required />
                <FormField label="Countries (comma-separated)" name="countries" id={`zone-${zone.id}-countries`} defaultValue={zone.countries} required />
                <FormField label="Price (£)" name="price" id={`zone-${zone.id}-price`} type="number" step="0.01" min="0" defaultValue={(zone.price / 100).toFixed(2)} required />
                <FormField label="Free delivery threshold (£, optional)" name="freeThreshold" id={`zone-${zone.id}-freeThreshold`} type="number" step="0.01" min="0" defaultValue={zone.freeThreshold ? (zone.freeThreshold / 100).toFixed(2) : undefined} />
                <FormField label="Estimated delivery time" name="estimatedDays" id={`zone-${zone.id}-estimatedDays`} defaultValue={zone.estimatedDays ?? ""} />
                <FormCheckbox label="Active" name="isActive" defaultChecked={zone.isActive} />
                <div className="sm:col-span-2 flex justify-between items-center">
                  <SubmitButton>Save</SubmitButton>
                  <button type="submit" formAction={deleteDeliveryZone} className="text-rose-dark text-xs underline">
                    Delete zone
                  </button>
                </div>
              </form>
            </details>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 max-w-xl">
        <h2 className="font-semibold mb-4">Add Delivery Zone</h2>
        <form action={createDeliveryZone} className="space-y-4">
          <FormField label="Zone name" name="name" required placeholder="UK Standard" />
          <FormField label="Countries (comma-separated)" name="countries" required placeholder="United Kingdom" />
          <FormField label="Price (£)" name="price" type="number" step="0.01" min="0" required />
          <FormField label="Free delivery threshold (£, optional)" name="freeThreshold" type="number" step="0.01" min="0" />
          <FormField label="Estimated delivery time" name="estimatedDays" placeholder="2-4 working days" />
          <FormCheckbox label="Active" name="isActive" defaultChecked />
          <SubmitButton>Add Zone</SubmitButton>
        </form>
      </div>
    </div>
  );
}
