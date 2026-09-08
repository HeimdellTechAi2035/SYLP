"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/lib/actions/newsletter";

const initialState: NewsletterState = { status: "idle" };

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <p className="text-ink font-medium text-sm">Join the mailing list</p>
        <p className="text-ink/70 text-xs mt-0.5">New designs, seasonal drops and offers. No spam.</p>
      </div>
      <form action={formAction} className="flex gap-2 w-full sm:w-auto">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="px-4 py-2 rounded-full bg-blush border border-ink/30 text-ink placeholder:text-ink/50 text-sm flex-1 sm:w-64 outline-none focus-visible:border-ink"
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
        <p role="status" className="text-xs text-ink font-medium">
          {state.message}
        </p>
      )}
    </div>
  );
}
