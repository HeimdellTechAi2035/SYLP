import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/admin/categories";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Categories" />

      <div className="space-y-4 mb-10">
        {categories.map((cat) => {
          const bound = updateCategory.bind(null, cat.id);
          return (
            <details key={cat.id} className="bg-blush rounded-xl p-4">
              <summary className="cursor-pointer font-medium flex justify-between items-center">
                {cat.name}
                <span className="text-xs text-ink-soft">{cat.isActive ? "Active" : "Hidden"}</span>
              </summary>
              <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                <input type="hidden" name="categoryId" value={cat.id} />
                <FormField label="Name" name="name" id={`cat-${cat.id}-name`} defaultValue={cat.name} required />
                <FormField label="Slug" name="slug" id={`cat-${cat.id}-slug`} defaultValue={cat.slug} required />
                <div className="sm:col-span-2">
                  <FormTextarea label="Description" name="description" id={`cat-${cat.id}-description`} defaultValue={cat.description ?? ""} />
                </div>
                <ImageDropzone name="image" label="Image" defaultValue={cat.image} aspect={4 / 5} />
                <FormCheckbox label="Active (visible on storefront)" name="isActive" defaultChecked={cat.isActive} />
                <div className="sm:col-span-2 flex justify-between items-center">
                  <SubmitButton>Save</SubmitButton>
                  <button type="submit" formAction={deleteCategory} className="text-rose-dark text-xs underline">
                    Delete category
                  </button>
                </div>
              </form>
            </details>
          );
        })}
      </div>

      <div className="bg-blush rounded-xl p-6 max-w-xl">
        <h2 className="font-semibold mb-4">Add Category</h2>
        <form action={createCategory} className="space-y-4">
          <FormField label="Name" name="name" required />
          <FormField label="Slug" name="slug" required placeholder="wax-melts" />
          <FormTextarea label="Description" name="description" />
          <ImageDropzone name="image" label="Image" aspect={4 / 5} />
          <FormCheckbox label="Active (visible on storefront)" name="isActive" defaultChecked />
          <SubmitButton>Add Category</SubmitButton>
        </form>
      </div>
    </div>
  );
}
