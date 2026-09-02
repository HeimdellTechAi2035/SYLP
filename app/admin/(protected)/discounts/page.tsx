import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormSelect, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import { createDiscount, updateDiscount, deleteDiscount } from "@/lib/actions/admin/discounts";

function formatValue(type: string, value: number) {
  return type === "PERCENTAGE" ? `${value}%` : formatPence(value);
}

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="Discounts" />

      <div className="space-y-4 mb-10">
        {discounts.map((d) => {
          const bound = updateDiscount.bind(null, d.id);
          const toDateInput = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : undefined);
          return (
            <details key={d.id} className="bg-white rounded-xl p-4">
              <summary className="cursor-pointer font-medium flex justify-between items-center">
                <span>{d.code} &middot; {formatValue(d.type, d.value)}</span>
                <span className="text-xs text-ink-soft">
                  {d.timesUsed}{d.maxUses ? ` / ${d.maxUses}` : ""} used &middot; {d.isActive ? "Active" : "Inactive"}
                </span>
              </summary>
              <form action={bound} className="space-y-4 mt-4">
                <input type="hidden" name="discountId" value={d.id} />
                <FormField label="Code" name="code" id={`disc-${d.id}-code`} defaultValue={d.code} required />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Type"
                    name="type"
                    id={`disc-${d.id}-type`}
                    defaultValue={d.type}
                    options={[{ value: "PERCENTAGE", label: "Percentage off" }, { value: "FIXED", label: "Fixed amount off (£)" }]}
                  />
                  <FormField
                    label="Value"
                    name="value"
                    id={`disc-${d.id}-value`}
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={d.type === "FIXED" ? (d.value / 100).toFixed(2) : d.value}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Minimum spend (£, optional)" name="minimumSpend" id={`disc-${d.id}-minimumSpend`} type="number" step="0.01" min="0" defaultValue={d.minimumSpend ? (d.minimumSpend / 100).toFixed(2) : undefined} />
                  <FormField label="Max total uses (optional)" name="maxUses" id={`disc-${d.id}-maxUses`} type="number" min="1" defaultValue={d.maxUses ?? undefined} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Per-customer limit (optional)" name="perCustomerLimit" id={`disc-${d.id}-perCustomerLimit`} type="number" min="1" defaultValue={d.perCustomerLimit ?? undefined} />
                  <div />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Start date (optional)" name="startDate" id={`disc-${d.id}-startDate`} type="date" defaultValue={toDateInput(d.startDate)} />
                  <FormField label="End date (optional)" name="endDate" id={`disc-${d.id}-endDate`} type="date" defaultValue={toDateInput(d.endDate)} />
                </div>
                <FormCheckbox label="Active" name="isActive" defaultChecked={d.isActive} />
                <div className="flex justify-between items-center">
                  <SubmitButton>Save</SubmitButton>
                  <button type="submit" formAction={deleteDiscount} className="text-rose-dark text-xs underline">
                    Delete discount
                  </button>
                </div>
              </form>
            </details>
          );
        })}
        {discounts.length === 0 && <p className="text-ink-soft text-sm">No discount codes yet.</p>}
      </div>

      <div className="bg-white rounded-xl p-6 max-w-xl">
        <h2 className="font-semibold mb-4">Add Discount Code</h2>
        <form action={createDiscount} className="space-y-4">
          <FormField label="Code" name="code" required placeholder="WELCOME10" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              name="type"
              defaultValue="PERCENTAGE"
              options={[{ value: "PERCENTAGE", label: "Percentage off" }, { value: "FIXED", label: "Fixed amount off (£)" }]}
            />
            <FormField label="Value" name="value" type="number" step="0.01" min="0" required placeholder="10" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Minimum spend (£, optional)" name="minimumSpend" type="number" step="0.01" min="0" />
            <FormField label="Max total uses (optional)" name="maxUses" type="number" min="1" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Per-customer limit (optional)" name="perCustomerLimit" type="number" min="1" />
            <div />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Start date (optional)" name="startDate" type="date" />
            <FormField label="End date (optional)" name="endDate" type="date" />
          </div>
          <FormCheckbox label="Active" name="isActive" defaultChecked />
          <SubmitButton>Add Discount</SubmitButton>
        </form>
      </div>
    </div>
  );
}
