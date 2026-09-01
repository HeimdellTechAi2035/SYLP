import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// A placeholder key lets the rest of the app run before real Stripe keys are
// added — checkout itself will fail clearly if you try to use it with a
// placeholder key, rather than crashing the whole app at import time.
export const stripe = new Stripe(secretKey || "sk_test_placeholder", {
  apiVersion: "2026-08-26.dahlia",
});

export function stripeConfigured(): boolean {
  return Boolean(secretKey && !secretKey.includes("placeholder"));
}
