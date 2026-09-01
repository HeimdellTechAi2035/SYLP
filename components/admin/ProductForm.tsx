import { FormField, FormTextarea, FormSelect, FormCheckbox, SubmitButton } from "@/components/admin/FormField";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  status: string;
  productType: string;
  categoryId: string | null;
  fragranceId: string | null;
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
  waxType: string | null;
  wickType: string | null;
  vesselInfo: string | null;
  netWeightGrams: number | null;
  dimensions: string | null;
  meltFormat: string | null;
  piecesCount: number | null;
  recommendedUsage: string | null;
  storageGuidance: string | null;
  candleWeightGrams: number | null;
  vesselSize: string | null;
  burnInstructions: string | null;
  candleCare: string | null;
  burnTimeHours: number | null;
  firstBurnInstructions: string | null;
  wickTrimmingGuidance: string | null;
  maxBurnSessionHours: number | null;
  safetyWarnings: string | null;
  allergenInfo: string | null;
  clpInfo: string | null;
  supplierManufacturerDetails: string | null;
  batchReference: string | null;
  ingredientsInfo: string | null;
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
} | null;

export default function ProductForm({
  action,
  product,
  categories,
  fragrances,
}: {
  action: (formData: FormData) => Promise<void> | void;
  product: ProductWithRelations;
  categories: { id: string; name: string }[];
  fragrances: { id: string; name: string }[];
}) {
  const p = product;
  const pence = (v: number | null | undefined) => (v != null ? (v / 100).toFixed(2) : "");

  return (
    <form action={action} className="space-y-10 max-w-3xl">
      <Section title="Core">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Product name" name="name" defaultValue={p?.name} required />
          <FormField label="Slug (URL)" name="slug" defaultValue={p?.slug} required placeholder="vanilla-dream-candle" />
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
            defaultValue={p?.productType ?? "WAX_MELT"}
            options={[
              { value: "WAX_MELT", label: "Wax Melt" },
              { value: "CANDLE", label: "Candle" },
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
          <FormSelect
            label="Fragrance"
            name="fragranceId"
            defaultValue={p?.fragranceId ?? ""}
            options={[{ value: "", label: "None" }, ...fragrances.map((f) => ({ value: f.id, label: f.name }))]}
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

      <Section title="Stock">
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Stock quantity" name="stockQuantity" type="number" min="0" defaultValue={p?.stockQuantity ?? 0} required />
          <FormField label="Low stock threshold" name="lowStockThreshold" type="number" min="0" defaultValue={p?.lowStockThreshold ?? 5} required />
          <FormField label="Production time (days)" name="productionTimeDays" type="number" min="0" defaultValue={p?.productionTimeDays ?? undefined} />
        </div>
        <div className="flex gap-6">
          <FormCheckbox label="Continue selling when out of stock" name="continueSellingOOS" defaultChecked={p?.continueSellingOOS} />
          <FormCheckbox label="Made to order" name="madeToOrder" defaultChecked={p?.madeToOrder} />
        </div>
      </Section>

      <Section title="Media">
        <FormField label="Main image URL" name="mainImage" defaultValue={p?.mainImage ?? ""} placeholder="https://..." />
        <p className="text-xs text-ink-soft">Additional gallery images and variants can be managed after saving.</p>
      </Section>

      <Section title="Materials & Size">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Wax type" name="waxType" defaultValue={p?.waxType ?? ""} />
          <FormField label="Wick type" name="wickType" defaultValue={p?.wickType ?? ""} />
          <FormField label="Vessel info" name="vesselInfo" defaultValue={p?.vesselInfo ?? ""} />
          <FormField label="Net weight (g)" name="netWeightGrams" type="number" min="0" defaultValue={p?.netWeightGrams ?? undefined} />
          <FormField label="Dimensions" name="dimensions" defaultValue={p?.dimensions ?? ""} />
        </div>
      </Section>

      <Section title="Wax Melt Specific">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Melt format" name="meltFormat" defaultValue={p?.meltFormat ?? ""} placeholder="Snap Bar" />
          <FormField label="Pieces count" name="piecesCount" type="number" min="0" defaultValue={p?.piecesCount ?? undefined} />
        </div>
        <FormTextarea label="Recommended usage" name="recommendedUsage" defaultValue={p?.recommendedUsage ?? ""} />
        <FormTextarea label="Storage guidance" name="storageGuidance" defaultValue={p?.storageGuidance ?? ""} />
      </Section>

      <Section title="Candle Specific">
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Candle weight (g)" name="candleWeightGrams" type="number" min="0" defaultValue={p?.candleWeightGrams ?? undefined} />
          <FormField label="Vessel size" name="vesselSize" defaultValue={p?.vesselSize ?? ""} />
          <FormField label="Approx. burn time (hours)" name="burnTimeHours" type="number" min="0" defaultValue={p?.burnTimeHours ?? undefined} />
          <FormField label="Max burn session (hours)" name="maxBurnSessionHours" type="number" min="0" defaultValue={p?.maxBurnSessionHours ?? undefined} />
        </div>
        <FormTextarea label="Burn instructions" name="burnInstructions" defaultValue={p?.burnInstructions ?? ""} />
        <FormTextarea label="First burn instructions" name="firstBurnInstructions" defaultValue={p?.firstBurnInstructions ?? ""} />
        <FormTextarea label="Candle care" name="candleCare" defaultValue={p?.candleCare ?? ""} />
        <FormTextarea label="Wick trimming guidance" name="wickTrimmingGuidance" defaultValue={p?.wickTrimmingGuidance ?? ""} />
      </Section>

      <Section title="Compliance & Safety" description="Leave fields blank if not applicable to this product. Do not copy generic wording — enter reviewed, product-specific information.">
        <FormTextarea label="Safety warnings" name="safetyWarnings" defaultValue={p?.safetyWarnings ?? ""} />
        <FormTextarea label="Allergen information" name="allergenInfo" defaultValue={p?.allergenInfo ?? ""} />
        <FormTextarea label="CLP / hazard information" name="clpInfo" defaultValue={p?.clpInfo ?? ""} />
        <FormTextarea label="Ingredients / fragrance information" name="ingredientsInfo" defaultValue={p?.ingredientsInfo ?? ""} />
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
