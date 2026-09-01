import { prisma } from "@/lib/prisma";

export type DiscountResult =
  | { valid: true; discountId: string; amount: number; code: string }
  | { valid: false; message: string };

/** Recalculates the discount server-side. Never trust a discount amount submitted by the client. */
export async function validateDiscountCode(
  code: string,
  subtotal: number,
  email: string
): Promise<DiscountResult> {
  const discount = await prisma.discount.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!discount || !discount.isActive) return { valid: false, message: "This discount code is not valid." };

  const now = new Date();
  if (discount.startDate && now < discount.startDate) return { valid: false, message: "This discount code is not active yet." };
  if (discount.endDate && now > discount.endDate) return { valid: false, message: "This discount code has expired." };
  if (discount.minimumSpend && subtotal < discount.minimumSpend) {
    return { valid: false, message: `This code requires a minimum spend of ${(discount.minimumSpend / 100).toFixed(2)}.` };
  }
  if (discount.maxUses && discount.timesUsed >= discount.maxUses) {
    return { valid: false, message: "This discount code has reached its usage limit." };
  }
  if (discount.perCustomerLimit) {
    const usedByCustomer = await prisma.order.count({
      where: { email, discountCode: discount.code, paymentStatus: "PAID" },
    });
    if (usedByCustomer >= discount.perCustomerLimit) {
      return { valid: false, message: "You've already used this discount code." };
    }
  }

  const amount =
    discount.type === "PERCENTAGE"
      ? Math.round((subtotal * discount.value) / 100)
      : Math.min(discount.value, subtotal);

  return { valid: true, discountId: discount.id, amount, code: discount.code };
}
