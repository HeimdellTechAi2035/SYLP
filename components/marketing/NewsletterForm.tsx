"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/lib/actions/newsletter";

const initialState: NewsletterState = { status: "idle" };

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <p className="text-cream font-medium text-sm">Join the mailing list</p>
        <p className="text-cream/60 text-xs mt-0.5">New fragrances, seasonal drops and offers. No spam.</p>
      </div>
      <form action={formAction} className="flex gap-2 w-full sm:w-auto">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="px-4 py-2 rounded-full bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 text-sm flex-1 sm:w-64 outline-none focus-visible:border-cream/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-full bg-rose text-ink font-semibold text-sm hover:bg-blush transition-colors disabled:opacity-60"
        >
          {pending ? "Joining..." : "Join"}
        </button>
      </form>
      {state.status !== "idle" && (
        <p role="status" className={`text-xs ${state.status === "success" ? "text-sage" : "text-rose"}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}
