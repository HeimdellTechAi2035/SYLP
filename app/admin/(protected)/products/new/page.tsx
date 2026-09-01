import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/admin/products";

export default async function NewProductPage() {
  const [categories, fragrances] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.fragrance.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Add Product" />
      <ProductForm action={createProduct} product={null} categories={categories} fragrances={fragrances} />
    </div>
  );
}
