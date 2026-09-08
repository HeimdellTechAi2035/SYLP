import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Please enter your name").max(120),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(40).optional().or(z.literal("")),
  orderNumber: z.string().max(40).optional().or(z.literal("")),
  category: z.enum([
    "Product question",
    "Sizing question",
    "Order question",
    "Delivery",
    "Return",
    "Refund",
    "Damaged item",
    "Complaint",
    "Wholesale enquiry",
    "Other",
  ]),
  message: z.string().min(1, "Please enter a message").max(4000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().max(40).optional().or(z.literal("")),
  shippingLine1: z.string().min(1).max(160),
  shippingLine2: z.string().max(160).optional().or(z.literal("")),
  shippingCity: z.string().min(1).max(80),
  shippingCounty: z.string().max(80).optional().or(z.literal("")),
  shippingPostcode: z.string().min(1).max(20),
  shippingCountry: z.string().min(1).max(80),
  giftMessage: z.string().max(500).optional().or(z.literal("")),
  discountCode: z.string().max(40).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().or(z.literal("")),
  body: z.string().min(1).max(4000),
});

// --- Admin ---

export const productStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export const productTypes = ["APPAREL", "ACCESSORY", "DRINKWARE", "STATIONERY", "HOMEWARE", "GIFT_SET", "OTHER"] as const;

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  sku: z.string().min(1, "SKU is required").max(60),
  status: z.enum(productStatuses),
  productType: z.enum(productTypes),
  categoryId: z.string().optional().or(z.literal("")),
  shortDescription: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(8000).optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional(),
  saleActive: z.coerce.boolean().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  continueSellingOOS: z.coerce.boolean().optional(),
  madeToOrder: z.coerce.boolean().optional(),
  productionTimeDays: z.coerce.number().int().min(0).optional(),
  mainImage: z.string().optional().or(z.literal("")),
  featured: z.coerce.boolean().optional(),
  bestSeller: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  seasonal: z.coerce.boolean().optional(),
  giftable: z.coerce.boolean().optional(),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(1000).optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

export const discountFormSchema = z.object({
  code: z.string().min(1).max(40),
  type: z.enum(["FIXED", "PERCENTAGE"]),
  value: z.coerce.number().min(1),
  minimumSpend: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  perCustomerLimit: z.coerce.number().int().min(1).optional(),
  isActive: z.coerce.boolean().optional(),
});
