import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { createDivision, updateDivision, deleteDivision } from "@/lib/actions/admin/divisions";

export default async function AdminDivisionsPage() {
  const divisions = await prisma.division.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Divisions" />
      <p className="text-sm text-ink-soft mb-6 max-w-2xl">
        Each division gets a box on the homepage and its own merch page. Tag products to a division from the product edit screen.
      </p>

      <div className="space-y-4 mb-10">
        {divisions.map((cat) => {
          const bound = updateDivision.bind(null, cat.id);
          return (
            <details key={cat.id} className="bg-blush rounded-xl p-4">
              <summary className="cursor-pointer font-medium flex justify-between items-center">
                {cat.name}
                <span className="text-xs text-ink-soft">{cat.isActive ? "Active" : "Hidden"}</span>
              </summary>
              <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                <input type="hidden" name="divisionId" value={cat.id} />
                <FormField label="Name" name="name" id={`div-${cat.id}-name`} defaultValue={cat.name} required />
                <FormField label="Slug" name="slug" id={`div-${cat.id}-slug`} defaultValue={cat.slug} required />
                <div className="sm:col-span-2">
                  <FormTextarea label="Description" name="description" id={`div-${cat.id}-description`} defaultValue={cat.description ?? ""} />
                </div>
                <ImageDropzone name="image" label="Badge or photo (optional)" defaultValue={cat.image} aspect={4 / 5} />
                <FormField label="Order on homepage (1 = first)" name="sortOrder" id={`div-${cat.id}-sortOrder`} type="number" defaultValue={String(cat.sortOrder)} />
                <FormCheckbox label="Active (visible on storefront)" name="isActive" defaultChecked={cat.isActive} />
                <div className="sm:col-span-2 flex justify-between items-center">
                  <SubmitButton>Save</SubmitButton>
                  <button type="submit" formAction={deleteDivision} className="text-rose-dark text-xs underline">
                    Delete division
                  </button>
                </div>
              </form>
            </details>
          );
        })}
      </div>

      <div className="bg-blush rounded-xl p-6 max-w-xl">
        <h2 className="font-semibold mb-4">Add Division</h2>
        <form action={createDivision} className="space-y-4">
          <FormField label="Name" name="name" required />
          <FormField label="Slug" name="slug" required placeholder="preston-patriots" />
          <FormTextarea label="Description" name="description" />
          <ImageDropzone name="image" label="Badge or photo (optional)" aspect={4 / 5} />
          <FormField label="Order on homepage (1 = first)" name="sortOrder" type="number" defaultValue="99" />
          <FormCheckbox label="Active (visible on storefront)" name="isActive" defaultChecked />
          <SubmitButton>Add Division</SubmitButton>
        </form>
      </div>
    </div>
  );
}
