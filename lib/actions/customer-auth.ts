"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, destroyCustomerSession } from "@/lib/customer-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export type AuthFormState = { status: "idle" | "error"; message?: string };

const registerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerCustomer(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message || "Please check the form." };
  }

  const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing?.passwordHash) {
    return { status: "error", message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const customer = await prisma.customer.upsert({
    where: { email: parsed.data.email },
    update: { passwordHash, firstName: parsed.data.firstName, lastName: parsed.data.lastName },
    create: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash,
    },
  });

  await createCustomerSession({ sub: customer.id, email: customer.email });
  revalidatePath("/account");
  return { status: "idle" };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginCustomer(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", message: "Please enter a valid email and password." };

  const ip = await getClientIp();
  if (isRateLimited(`customer-login:${ip}:${parsed.data.email}`, 5, 5 * 60 * 1000)) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (!customer?.passwordHash || !(await bcrypt.compare(parsed.data.password, customer.passwordHash))) {
    return { status: "error", message: "Incorrect email or password." };
  }

  await createCustomerSession({ sub: customer.id, email: customer.email });
  revalidatePath("/account");
  return { status: "idle" };
}

export async function logoutCustomer() {
  await destroyCustomerSession();
  revalidatePath("/account");
}
