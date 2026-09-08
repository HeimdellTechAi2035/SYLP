"use server";

import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validation";
import { getSiteSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email/provider";

export type NewsletterState = { status: "idle" | "success" | "error"; message?: string };

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  let isNewSubscriber = false;
  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      isNewSubscriber = false;
    } else {
      await prisma.newsletterSubscriber.create({ data: { email: parsed.data.email, source: "footer" } });
      isNewSubscriber = true;
    }
  } catch {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  // Best-effort notification only — a failed/unconfigured email provider
  // must never turn a successful signup into an error for the customer.
  if (isNewSubscriber) {
    try {
      const settings = await getSiteSettings();
      if (settings.supportEmail) {
        await sendEmail({
          to: settings.supportEmail,
          subject: "New newsletter signup",
          text: `${parsed.data.email} just subscribed to the newsletter from the site footer.`,
        });
      }
    } catch (err) {
      console.error("Newsletter signup notification email failed:", (err as Error).message);
    }
  }

  return { status: "success", message: "Thanks for subscribing!" };
}
