"use server";

import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validation";

export type ContactFormState = { status: "idle" | "success" | "error"; message?: string };

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    orderNumber: formData.get("orderNumber") || "",
    category: formData.get("category"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fill in all required fields correctly." };
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      orderNumber: parsed.data.orderNumber || null,
      category: parsed.data.category,
      message: parsed.data.message,
    },
  });

  return { status: "success", message: "Thanks for getting in touch — we'll reply as soon as we can." };
}
