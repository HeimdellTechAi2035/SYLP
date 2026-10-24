import { validateDiscountCode } from "@/lib/discounts";
import { resolveDeliveryDetails } from "@/lib/delivery";

export type CheckoutQuote = {
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  deliveryAmount: number;
  deliveryMethodName: string;
  total: number;
};

/** Shared by the visible quote and Stripe handoff; all amounts are server-calculated pence. */
export async function buildCheckoutQuote(subtotal: number, email: string, code = "") {
  let discountAmount = 0;
  let discountCode: string | null = null;
  if (code.trim()) {
    const discount = await validateDiscountCode(code, subtotal, email);
    if (!discount.valid) return { ok: false as const, message: discount.message };
    discountAmount = Math.min(subtotal, Math.max(0, discount.amount));
    discountCode = discount.code;
  }
  const delivery = await resolveDeliveryDetails(subtotal - discountAmount, "United Kingdom");
  const quote: CheckoutQuote = {
    subtotal, discountAmount, discountCode,
    deliveryAmount: delivery.amount,
    deliveryMethodName: delivery.methodName ?? "Standard UK postage",
    total: subtotal - discountAmount + delivery.amount,
  };
  return { ok: true as const, quote, estimatedPostageCost: delivery.estimatedPostageCost };
}
