import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/admin/products";

export default async function NewProductPage() {
  const [categories, packagingProfiles, divisions] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.packagingProfile.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.division.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Add Product" />
      <ProductForm action={createProduct} product={null} categories={categories} divisions={divisions} packagingProfiles={packagingProfiles} />
    </div>
  );
}
