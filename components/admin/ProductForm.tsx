import { FormField, FormTextarea, FormSelect, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import InventoryFields from "@/components/admin/InventoryFields";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  status: string;
  productType: string;
  categoryId: string | null;
  shortDescription: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  costPrice: number | null;
  saleActive: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  continueSellingOOS: boolean;
  madeToOrder: boolean;
  productionTimeDays: number | null;
  mainImage: string | null;
  material: string | null;
  careInstructions: string | null;
  netWeightGrams: number | null;
  dimensions: string | null;
  safetyWarnings: string | null;
  supplierManufacturerDetails: string | null;
  batchReference: string | null;
  safetyDocumentUrl: string | null;
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  seasonal: boolean;
  giftable: boolean;
  giftPackagingAvailable: boolean;
  giftMessageEnabled: boolean;
  seoTitle: string | null;
  metaDescription: string | null;
  packagingProfileId: string | null;
} | null;

export default function ProductForm({
  action,
  product,
  categories,
  packagingProfiles,
}: {
  action: (formData: FormData) => Promise<void> | void;
  product: ProductWithRelations;
  categories: { id: string; name: string }[];
  packagingProfiles: { id: string; name: string }[];
}) {
  const p = product;
  const pence = (v: number | null | undefined) => (v != null ? (v / 100).toFixed(2) : "");

  return (
    <form action={action} className="space-y-10 max-w-3xl">
      <Section title="Core">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Product name" name="name" defaultValue={p?.name} required />
          <FormField label="Slug (URL)" name="slug" defaultValue={p?.slug} required placeholder="patriot-platform-hoodie" />
          <FormField label="SKU" name="sku" defaultValue={p?.sku} required />
          <FormSelect
            label="Status"
            name="status"
            defaultValue={p?.status ?? "DRAFT"}
            options={[{ value: "DRAFT", label: "Draft" }, { value: "ACTIVE", label: "Active" }, { value: "ARCHIVED", label: "Archived" }]}
          />
          <FormSelect
            label="Product type"
            name="productType"
            defaultValue={p?.productType ?? "APPAREL"}
            options={[
              { value: "APPAREL", label: "Apparel" },
              { value: "ACCESSORY", label: "Accessory" },
              { value: "DRINKWARE", label: "Drinkware" },
              { value: "STATIONERY", label: "Stationery" },
              { value: "HOMEWARE", label: "Homeware" },
              { value: "GIFT_SET", label: "Gift Set" },
              { value: "OTHER", label: "Other" },
            ]}
          />
          <FormSelect
            label="Category"
            name="categoryId"
            defaultValue={p?.categoryId ?? ""}
            options={[{ value: "", label: "None" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>
        <FormTextarea label="Short description" name="shortDescription" defaultValue={p?.shortDescription ?? ""} rows={2} />
        <FormTextarea label="Full description" name="description" defaultValue={p?.description ?? ""} rows={5} />
      </Section>

      <Section title="Pricing">
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Price (£)" name="price" type="number" step="0.01" min="0" defaultValue={pence(p?.price) || undefined} required />
          <FormField label="Sale price (£)" name="salePrice" type="number" step="0.01" min="0" defaultValue={pence(p?.salePrice) || undefined} />
          <FormField label="Cost price (£, internal only)" name="costPrice" type="number" step="0.01" min="0" defaultValue={pence(p?.costPrice) || undefined} />
        </div>
        <FormCheckbox label="Sale is currently active" name="saleActive" defaultChecked={p?.saleActive} />
      </Section>

      <Section title="Inventory">
        <InventoryFields
          trackStock={p ? !p.madeToOrder : false}
          stockQuantity={p?.stockQuantity ?? 0}
          lowStockThreshold={p?.lowStockThreshold ?? 5}
          continueSellingOOS={p?.continueSellingOOS ?? false}
        />
        <FormField label="Production time (days)" name="productionTimeDays" type="number" min="0" defaultValue={p?.productionTimeDays ?? undefined} />
      </Section>

      <Section title="Fulfilment Packaging" description="Internal only — never shown to the customer. Works the same whether this product is made to order or stock-tracked.">
        <FormSelect
          label="Packaging profile"
          name="packagingProfileId"
          defaultValue={p?.packagingProfileId ?? ""}
          options={[{ value: "", label: "None assigned" }, ...packagingProfiles.map((prof) => ({ value: prof.id, label: prof.name }))]}
        />
      </Section>

      <Section title="Media">
        <FormField label="Main image URL" name="mainImage" defaultValue={p?.mainImage ?? ""} placeholder="https://..." />
        <p className="text-xs text-ink-soft">Additional gallery images and variants can be managed after saving.</p>
      </Section>

      <Section title="Materials & Size">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Material" name="material" defaultValue={p?.material ?? ""} placeholder="100% cotton, stainless steel..." />
          <FormField label="Net weight (g)" name="netWeightGrams" type="number" min="0" defaultValue={p?.netWeightGrams ?? undefined} />
          <FormField label="Dimensions" name="dimensions" defaultValue={p?.dimensions ?? ""} />
        </div>
        <FormTextarea label="Care instructions (e.g. wash/dry guidance)" name="careInstructions" defaultValue={p?.careInstructions ?? ""} />
      </Section>

      <Section title="Compliance & Safety" description="Leave fields blank if not applicable to this product. Do not copy generic wording — enter reviewed, product-specific information.">
        <FormTextarea label="Safety warnings (e.g. small-parts choking hazard)" name="safetyWarnings" defaultValue={p?.safetyWarnings ?? ""} />
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Supplier / manufacturer details" name="supplierManufacturerDetails" defaultValue={p?.supplierManufacturerDetails ?? ""} />
          <FormField label="Batch reference" name="batchReference" defaultValue={p?.batchReference ?? ""} />
        </div>
        <FormField label="Safety document URL" name="safetyDocumentUrl" defaultValue={p?.safetyDocumentUrl ?? ""} />
      </Section>

      <Section title="Merchandising">
        <div className="flex flex-wrap gap-6">
          <FormCheckbox label="Featured" name="featured" defaultChecked={p?.featured} />
          <FormCheckbox label="Best seller" name="bestSeller" defaultChecked={p?.bestSeller} />
          <FormCheckbox label="New" name="isNew" defaultChecked={p?.isNew} />
          <FormCheckbox label="Seasonal" name="seasonal" defaultChecked={p?.seasonal} />
          <FormCheckbox label="Giftable" name="giftable" defaultChecked={p?.giftable} />
        </div>
      </Section>

      <Section title="Gift Set Options" description="Only relevant if product type is Gift Set.">
        <div className="flex gap-6">
          <FormCheckbox label="Gift packaging available" name="giftPackagingAvailable" defaultChecked={p?.giftPackagingAvailable} />
          <FormCheckbox label="Allow gift message at checkout" name="giftMessageEnabled" defaultChecked={p?.giftMessageEnabled} />
        </div>
      </Section>

      <Section title="SEO">
        <FormField label="SEO title" name="seoTitle" defaultValue={p?.seoTitle ?? ""} />
        <FormTextarea label="Meta description" name="metaDescription" defaultValue={p?.metaDescription ?? ""} rows={2} />
      </Section>

      <SubmitButton>{product ? "Save Changes" : "Create Product"}</SubmitButton>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-ink/10 pt-6 space-y-4">
      <legend className="font-semibold text-lg -mt-9 bg-cream-dark pr-3">{title}</legend>
      {description && <p className="text-xs text-ink-soft">{description}</p>}
      {children}
    </fieldset>
  );
}
