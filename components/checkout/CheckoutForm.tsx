"use client";

import { useActionState } from "react";
import { startCheckout, type CheckoutState } from "@/lib/actions/checkout";

const initialState: CheckoutState = { status: "idle" };

export default function CheckoutForm({ giftMessageEnabled }: { giftMessageEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(startCheckout, initialState);

  return (
    <form action={formAction} className="space-y-8">
      {state.status === "error" && (
        <p className="bg-rose/10 text-rose-dark text-sm rounded-lg p-3">{state.message}</p>
      )}

      <fieldset className="space-y-4">
        <legend className="font-semibold text-lg mb-2">Contact</legend>
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone (optional)" name="phone" type="tel" />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold text-lg mb-2">Shipping address</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First name" name="firstName" required />
          <Field label="Last name" name="lastName" required />
        </div>
        <Field label="Address line 1" name="shippingLine1" required />
        <Field label="Address line 2 (optional)" name="shippingLine2" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Town / City" name="shippingCity" required />
          <Field label="County (optional)" name="shippingCounty" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Postcode" name="shippingPostcode" required />
          <Field label="Country" name="shippingCountry" required defaultValue="United Kingdom" />
        </div>
      </fieldset>

      {giftMessageEnabled && (
        <fieldset>
          <legend className="font-semibold text-lg mb-2">Gift message (optional)</legend>
          <textarea name="giftMessage" rows={2} maxLength={500} className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
        </fieldset>
      )}

      <fieldset>
        <legend className="font-semibold text-lg mb-2">Discount code</legend>
        <input name="discountCode" placeholder="Enter code" className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 rounded-full bg-rose text-ink font-semibold hover:bg-rose-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Redirecting to payment..." : "Continue to Payment"}
      </button>
      <p className="text-xs text-ink-soft text-center">
        You&apos;ll be redirected to Stripe to complete payment securely. We never see or store your card details.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-ink/15 px-3 py-2.5"
      />
    </div>
  );
}
