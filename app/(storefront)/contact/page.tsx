import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import ContactForm from "@/components/marketing/ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-page py-14">
      <div className="max-w-lg mb-10">
        <h1 className="font-display text-4xl mb-3">Contact Us</h1>
        <p className="text-ink-soft">
          Got a question about an order, sizing, or anything else? Send us a message and we&apos;ll get back to you.
          {settings.supportEmail && <> You can also email us directly at <a href={`mailto:${settings.supportEmail}`} className="text-rose-dark underline">{settings.supportEmail}</a>.</>}
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
