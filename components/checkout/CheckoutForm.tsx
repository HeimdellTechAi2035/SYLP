"use client";

import { useActionState, useState, useTransition, type ChangeEventHandler } from "react";
import { startCheckout, previewCheckout, type CheckoutState } from "@/lib/actions/checkout";
import type { CheckoutQuote } from "@/lib/checkout-quote";
import { formatPence } from "@/lib/money";

const initialState: CheckoutState = { status: "idle" };
type SummaryItem = { id: string; name: string; variant: string | null; quantity: number; lineTotal: number };

export default function CheckoutForm({ giftMessageEnabled, initialQuote, items }: {
  giftMessageEnabled: boolean; initialQuote: CheckoutQuote; items: SummaryItem[];
}) {
  const [state, formAction, pending] = useActionState(startCheckout, initialState);
  const [quote, setQuote] = useState(initialQuote);
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [quoteError, setQuoteError] = useState("");
  const [quoting, startQuote] = useTransition();
  const needsQuote = discountCode.trim().toUpperCase() !== (quote.discountCode ?? "") ||
    (Boolean(quote.discountCode) && email !== appliedEmail);

  function updateQuote() {
    setQuoteError("");
    startQuote(async () => {
      try {
        const result = await previewCheckout(discountCode, email);
        if (!result.ok) { setQuoteError(result.message); return; }
        setQuote(result.quote);
        setAppliedEmail(email);
      } catch {
        setQuoteError("We couldn't update your total. Please try again.");
      }
    });
  }

  return (
    <form action={formAction} className="grid lg:grid-cols-[1fr_360px] gap-10">
      <div className="space-y-8 min-w-0">
        {state.status === "error" && <p role="alert" className="bg-rose/10 text-ink text-sm rounded-lg p-3">{state.message}</p>}
        <fieldset className="space-y-4">
          <legend className="font-semibold text-lg mb-2">Contact</legend>
          <Field label="Email" name="email" type="email" autoComplete="email" required value={email}
            disabled={quoting} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Phone" name="phone" type="tel" autoComplete="tel" required />
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="font-semibold text-lg mb-2">Shipping address</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First name" name="firstName" autoComplete="shipping given-name" required />
            <Field label="Last name" name="lastName" autoComplete="shipping family-name" required />
          </div>
          <Field label="Address line 1" name="shippingLine1" autoComplete="shipping address-line1" required />
          <Field label="Address line 2 (optional)" name="shippingLine2" autoComplete="shipping address-line2" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Town / City" name="shippingCity" autoComplete="shipping address-level2" required />
            <Field label="County (optional)" name="shippingCounty" autoComplete="shipping address-level1" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Postcode" name="shippingPostcode" autoComplete="shipping postal-code" required />
            <div>
              <label htmlFor="shippingCountry" className="block text-sm font-medium mb-1">Country</label>
              <select id="shippingCountry" name="shippingCountry" autoComplete="shipping country-name" className="w-full rounded-lg border border-ink/15 bg-blush px-3 py-2.5 text-base">
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>
          </div>
        </fieldset>
        {giftMessageEnabled && (
          <fieldset>
            <legend className="font-semibold text-lg mb-2">Gift message (optional)</legend>
            <textarea aria-label="Gift message (optional)" name="giftMessage" rows={2} maxLength={500} className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-base" />
          </fieldset>
        )}
        <fieldset className="space-y-2">
          <legend className="font-semibold text-lg mb-2">Discount code</legend>
          <label htmlFor="discountCode" className="sr-only">Discount code</label>
          <div className="flex flex-wrap gap-2">
            <input id="discountCode" name="discountCode" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)}
              maxLength={100} disabled={quoting || pending} placeholder="Enter code" className="min-w-0 flex-1 rounded-lg border border-ink/15 px-3 py-2.5 text-base" />
            <button type="button" onClick={updateQuote} disabled={quoting || pending}
              className="min-h-11 px-4 py-2 rounded-lg border border-ink/30 font-medium disabled:opacity-60">
              {quoting ? "Updating…" : "Update total"}
            </button>
          </div>
          {quoteError && <p role="alert" className="text-sm text-ink">{quoteError}</p>}
          {needsQuote && <p className="text-sm text-ink-soft">Update your total to apply or remove this code before continuing.</p>}
        </fieldset>
        <div>
          <button type="submit" disabled={pending || quoting || needsQuote}
            className="w-full min-h-12 py-3.5 rounded-full bg-rose text-ink font-semibold hover:bg-rose-dark transition-colors disabled:opacity-60">
            {pending ? "Redirecting to payment..." : `Continue to Payment — ${formatPence(quote.total)}`}
          </button>
          <p className="text-xs text-ink-soft text-center mt-3">You&apos;ll be redirected to Stripe to complete payment securely. We never see or store your card details.</p>
        </div>
      </div>
      <aside aria-label="Order summary" aria-live="polite" className="bg-blush/70 rounded-2xl p-6 h-fit order-first lg:order-last min-w-0">
        <h2 className="font-semibold mb-4">Order Summary</h2>
        <ul className="space-y-3 mb-4">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm gap-2">
              <span className="text-ink-soft">{item.quantity} x {item.name}{item.variant && ` (${item.variant})`}</span>
              <span className="font-medium shrink-0">{formatPence(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="border-t border-ink/10 pt-3 space-y-3 text-sm">
          <div className="flex justify-between gap-3"><dt>Subtotal</dt><dd>{formatPence(quote.subtotal)}</dd></div>
          {quote.discountCode && <div className="flex justify-between gap-3"><dt>Discount ({quote.discountCode})</dt><dd>−{formatPence(quote.discountAmount)}</dd></div>}
          <div className="flex justify-between gap-3"><dt>UK postage</dt><dd>{quote.deliveryAmount === 0 ? "FREE" : formatPence(quote.deliveryAmount)}</dd></div>
          <div className="flex justify-between gap-3 border-t border-ink/15 pt-3 font-semibold text-lg"><dt>Total to pay</dt><dd>{formatPence(quote.total)}</dd></div>
        </dl>
        <p className="text-xs text-ink-soft mt-3">{quote.deliveryMethodName}. Free standard UK postage on orders over £50 after discounts.</p>
        {needsQuote && <p className="text-sm mt-3">Showing your last calculated total. Update it to include your changes.</p>}
      </aside>
    </form>
  );
}

function Field({ label, name, type = "text", required, autoComplete, value, onChange, disabled }: {
  label: string; name: string; type?: string; required?: boolean; autoComplete?: string;
  value?: string; onChange?: ChangeEventHandler<HTMLInputElement>; disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <input id={name} name={name} type={type} required={required} autoComplete={autoComplete}
        value={value} onChange={onChange} disabled={disabled} className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-base" />
    </div>
  );
}
