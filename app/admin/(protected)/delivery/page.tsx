import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, FormSelect, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import {
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  createPackagingProfile,
  updatePackagingProfile,
  deletePackagingProfile,
  createPostageRate,
  updatePostageRate,
  deletePostageRate,
} from "@/lib/actions/admin/delivery";

export default async function AdminDeliveryPage() {
  const [zones, packagingProfiles, postageRates] = await Promise.all([
    prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.packagingProfile.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.postageRate.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const postageRateOptions = [{ value: "", label: "None assigned" }, ...postageRates.map((r) => ({ value: r.id, label: `${r.name} — ${formatPence(r.cost)}` }))];

  return (
    <div>
      <AdminPageHeader title="Delivery, Postage & Packaging" />
      <p className="text-sm text-ink-soft mb-6">
        Delivery zones set what the customer pays and are shown on the storefront. Postage rates and packaging profiles are
        internal-only — they never appear to customers, and exist so the store owner can see real fulfilment cost and estimated margin
        on each order.
      </p>

      <section className="mb-12">
        <h2 className="font-semibold text-lg mb-1">Delivery Zones (customer-facing)</h2>
        <p className="text-xs text-ink-soft mb-4">Pricing and free-delivery thresholds shown on the storefront (basket, checkout, product pages).</p>

        <div className="space-y-4 mb-6">
          {zones.map((zone) => {
            const bound = updateDeliveryZone.bind(null, zone.id);
            return (
              <details key={zone.id} className="bg-blush rounded-xl p-4">
                <summary className="cursor-pointer font-medium flex justify-between items-center">
                  {zone.name}
                  <span className="text-xs text-ink-soft">{formatPence(zone.price)}</span>
                </summary>
                <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                  <input type="hidden" name="zoneId" value={zone.id} />
                  <FormField label="Zone name" name="name" id={`zone-${zone.id}-name`} defaultValue={zone.name} required />
                  <FormField label="Countries (comma-separated)" name="countries" id={`zone-${zone.id}-countries`} defaultValue={zone.countries} required />
                  <FormField label="Customer price (£)" name="price" id={`zone-${zone.id}-price`} type="number" step="0.01" min="0" defaultValue={(zone.price / 100).toFixed(2)} required />
                  <FormField label="Free delivery threshold (£, optional)" name="freeThreshold" id={`zone-${zone.id}-freeThreshold`} type="number" step="0.01" min="0" defaultValue={zone.freeThreshold ? (zone.freeThreshold / 100).toFixed(2) : undefined} />
                  <FormField label="Estimated delivery time" name="estimatedDays" id={`zone-${zone.id}-estimatedDays`} defaultValue={zone.estimatedDays ?? ""} />
                  <FormSelect
                    label="Internal postage rate expected"
                    name="postageRateId"
                    id={`zone-${zone.id}-postageRateId`}
                    defaultValue={zone.postageRateId ?? ""}
                    options={postageRateOptions}
                  />
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

        <div className="bg-blush rounded-xl p-6 max-w-xl">
          <h3 className="font-semibold mb-4">Add Delivery Zone</h3>
          <form action={createDeliveryZone} className="space-y-4">
            <FormField label="Zone name" name="name" required placeholder="UK Standard" />
            <FormField label="Countries (comma-separated)" name="countries" required placeholder="United Kingdom" />
            <FormField label="Customer price (£)" name="price" type="number" step="0.01" min="0" required />
            <FormField label="Free delivery threshold (£, optional)" name="freeThreshold" type="number" step="0.01" min="0" />
            <FormField label="Estimated delivery time" name="estimatedDays" placeholder="2-4 working days" />
            <FormSelect label="Internal postage rate expected" name="postageRateId" options={postageRateOptions} />
            <FormCheckbox label="Active" name="isActive" defaultChecked />
            <SubmitButton>Add Zone</SubmitButton>
          </form>
        </div>
      </section>

      <section className="mb-12 border-t border-ink/10 pt-8">
        <h2 className="font-semibold text-lg mb-1">Postage Rates (internal)</h2>
        <p className="text-xs text-ink-soft mb-4">
          What Support Your Local Patriot actually expects to pay the carrier — never shown to customers. Assign one to a delivery
          zone above once it exists.
        </p>

        <div className="space-y-4 mb-6">
          {postageRates.map((rate) => {
            const bound = updatePostageRate.bind(null, rate.id);
            return (
              <details key={rate.id} className="bg-blush rounded-xl p-4">
                <summary className="cursor-pointer font-medium flex justify-between items-center">
                  {rate.name}
                  <span className="text-xs text-ink-soft">{formatPence(rate.cost)}</span>
                </summary>
                <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                  <input type="hidden" name="rateId" value={rate.id} />
                  <FormField label="Carrier / service name" name="name" id={`rate-${rate.id}-name`} defaultValue={rate.name} required />
                  <FormField label="Expected cost (£)" name="cost" id={`rate-${rate.id}-cost`} type="number" step="0.01" min="0" defaultValue={(rate.cost / 100).toFixed(2)} required />
                  <FormField label="Min weight (g, optional)" name="minWeightGrams" id={`rate-${rate.id}-min`} type="number" min="0" defaultValue={rate.minWeightGrams ?? undefined} />
                  <FormField label="Max weight (g, optional)" name="maxWeightGrams" id={`rate-${rate.id}-max`} type="number" min="0" defaultValue={rate.maxWeightGrams ?? undefined} />
                  <FormCheckbox label="Active" name="isActive" defaultChecked={rate.isActive} />
                  <div className="sm:col-span-2 flex justify-between items-center">
                    <SubmitButton>Save</SubmitButton>
                    <button type="submit" formAction={deletePostageRate} className="text-rose-dark text-xs underline">
                      Delete rate
                    </button>
                  </div>
                </form>
              </details>
            );
          })}
        </div>

        <div className="bg-blush rounded-xl p-6 max-w-xl">
          <h3 className="font-semibold mb-4">Add Postage Rate</h3>
          <form action={createPostageRate} className="space-y-4">
            <FormField label="Carrier / service name" name="name" required placeholder="Royal Mail Tracked 48" />
            <FormField label="Expected cost (£)" name="cost" type="number" step="0.01" min="0" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Min weight (g, optional)" name="minWeightGrams" type="number" min="0" />
              <FormField label="Max weight (g, optional)" name="maxWeightGrams" type="number" min="0" />
            </div>
            <FormCheckbox label="Active" name="isActive" defaultChecked />
            <SubmitButton>Add Rate</SubmitButton>
          </form>
        </div>
      </section>

      <section className="border-t border-ink/10 pt-8">
        <h2 className="font-semibold text-lg mb-1">Packaging Profiles (internal)</h2>
        <p className="text-xs text-ink-soft mb-4">
          Assign one to a product (or a specific variant, to override) from its edit page. Charged once per order, never
          once per line item.
        </p>

        <div className="space-y-4 mb-6">
          {packagingProfiles.map((profile) => {
            const bound = updatePackagingProfile.bind(null, profile.id);
            return (
              <details key={profile.id} className="bg-blush rounded-xl p-4">
                <summary className="cursor-pointer font-medium flex justify-between items-center">
                  {profile.name}
                  <span className="text-xs text-ink-soft">{formatPence(profile.cost)}</span>
                </summary>
                <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                  <input type="hidden" name="profileId" value={profile.id} />
                  <FormField label="Profile name" name="name" id={`profile-${profile.id}-name`} defaultValue={profile.name} required />
                  <FormField label="Total packaging cost (£)" name="cost" id={`profile-${profile.id}-cost`} type="number" step="0.01" min="0" defaultValue={(profile.cost / 100).toFixed(2)} required />
                  <div className="sm:col-span-2">
                    <FormTextarea label="Description (optional)" name="description" id={`profile-${profile.id}-description`} defaultValue={profile.description ?? ""} rows={2} />
                  </div>
                  <FormCheckbox label="Active" name="isActive" defaultChecked={profile.isActive} />
                  <div className="sm:col-span-2 flex justify-between items-center">
                    <SubmitButton>Save</SubmitButton>
                    <button type="submit" formAction={deletePackagingProfile} className="text-rose-dark text-xs underline">
                      Delete profile
                    </button>
                  </div>
                </form>
              </details>
            );
          })}
        </div>

        <div className="bg-blush rounded-xl p-6 max-w-xl">
          <h3 className="font-semibold mb-4">Add Packaging Profile</h3>
          <form action={createPackagingProfile} className="space-y-4">
            <FormField label="Profile name" name="name" required placeholder="Small Parcel" />
            <FormField label="Total packaging cost (£)" name="cost" type="number" step="0.01" min="0" required />
            <FormTextarea label="Description (optional, e.g. Box + tissue + label/tape)" name="description" rows={2} />
            <FormCheckbox label="Active" name="isActive" defaultChecked />
            <SubmitButton>Add Profile</SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
