"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/lib/actions/contact";

const initialState: ContactFormState = { status: "idle" };

const categories = [
  "Product question",
  "Fragrance question",
  "Order question",
  "Delivery",
  "Return",
  "Refund",
  "Damaged item",
  "Complaint",
  "Wholesale enquiry",
  "Other",
];

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.status === "success") {
    return <p className="text-sage font-medium">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="Name" name="name" required />
        <TextField label="Email" name="email" type="email" required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="Phone (optional)" name="phone" type="tel" />
        <TextField label="Order number (optional)" name="orderNumber" />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">Subject</label>
        <select id="category" name="category" required className="w-full rounded-lg border border-ink/15 px-3 py-2.5">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
        <textarea id="message" name="message" rows={5} required className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
      </div>
      {state.status === "error" && <p className="text-rose-dark text-sm">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 rounded-full bg-rose-dark text-cream font-semibold hover:bg-ink transition-colors disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

function TextField({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <input id={name} name={name} type={type} required={required} className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
    </div>
  );
}
