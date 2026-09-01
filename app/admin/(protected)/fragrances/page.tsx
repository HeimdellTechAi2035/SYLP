import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import { createFragrance, updateFragrance, deleteFragrance } from "@/lib/actions/admin/fragrances";

export default async function AdminFragrancesPage() {
  const fragrances = await prisma.fragrance.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Fragrances" />

      <div className="space-y-4 mb-10">
        {fragrances.map((frag) => {
          const bound = updateFragrance.bind(null, frag.id);
          return (
            <details key={frag.id} className="bg-white rounded-xl p-4">
              <summary className="cursor-pointer font-medium flex justify-between items-center">
                {frag.name}
                <span className="text-xs text-ink-soft">{frag.scentFamily}</span>
              </summary>
              <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                <input type="hidden" name="fragranceId" value={frag.id} />
                <FormField label="Name" name="name" defaultValue={frag.name} required />
                <FormField label="Slug" name="slug" defaultValue={frag.slug} required />
                <FormField label="Scent family" name="scentFamily" defaultValue={frag.scentFamily ?? ""} placeholder="Fresh, Floral, Fruity, Sweet, Woody, Clean..." />
                <FormField label="Image URL" name="image" defaultValue={frag.image ?? ""} />
                <div className="sm:col-span-2">
                  <FormTextarea label="Description" name="description" defaultValue={frag.description ?? ""} />
                </div>
                <FormField label="Top notes" name="topNotes" defaultValue={frag.topNotes ?? ""} />
                <FormField label="Heart notes" name="heartNotes" defaultValue={frag.heartNotes ?? ""} />
                <FormField label="Base notes" name="baseNotes" defaultValue={frag.baseNotes ?? ""} />
                <div className="sm:col-span-2">
                  <FormTextarea label="Internal notes (not shown publicly)" name="internalNotes" defaultValue={frag.internalNotes ?? ""} />
                </div>
                <div className="flex gap-6">
                  <FormCheckbox label="Active" name="isActive" defaultChecked={frag.isActive} />
                  <FormCheckbox label="Seasonal" name="isSeasonal" defaultChecked={frag.isSeasonal} />
                </div>
                <div className="sm:col-span-2 flex justify-between items-center">
                  <SubmitButton>Save</SubmitButton>
                  <button type="submit" formAction={deleteFragrance} className="text-rose-dark text-xs underline">
                    Delete fragrance
                  </button>
                </div>
              </form>
            </details>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 max-w-xl">
        <h2 className="font-semibold mb-4">Add Fragrance</h2>
        <form action={createFragrance} className="space-y-4">
          <FormField label="Name" name="name" required />
          <FormField label="Slug" name="slug" required placeholder="vanilla-dream" />
          <FormField label="Scent family" name="scentFamily" />
          <FormTextarea label="Description" name="description" />
          <FormField label="Top notes" name="topNotes" />
          <FormField label="Heart notes" name="heartNotes" />
          <FormField label="Base notes" name="baseNotes" />
          <div className="flex gap-6">
            <FormCheckbox label="Active" name="isActive" defaultChecked />
            <FormCheckbox label="Seasonal" name="isSeasonal" />
          </div>
          <SubmitButton>Add Fragrance</SubmitButton>
        </form>
      </div>
    </div>
  );
}
