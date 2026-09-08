"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/lib/actions/reviews";
import { Star } from "lucide-react";

const initialState: ReviewFormState = { status: "idle" };

export default function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(5);

  if (state.status === "success") {
    return <p className="text-sage font-medium text-sm">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <span className="block text-sm font-medium mb-1">Your rating</span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
              aria-pressed={rating === i + 1}
            >
              <Star className={`h-6 w-6 ${i < rating ? "fill-gold text-gold" : "text-ink/20"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium mb-1">Name</label>
          <input id="customerName" name="customerName" required className="w-full rounded-lg border border-ink/15 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">Email (not published)</label>
          <input id="customerEmail" name="customerEmail" type="email" required className="w-full rounded-lg border border-ink/15 px-3 py-2" />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">Review title (optional)</label>
        <input id="title" name="title" maxLength={120} className="w-full rounded-lg border border-ink/15 px-3 py-2" />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium mb-1">Your review</label>
        <textarea id="body" name="body" required rows={4} maxLength={4000} className="w-full rounded-lg border border-ink/15 px-3 py-2" />
      </div>

      {state.status === "error" && <p className="text-rose-dark text-sm">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 rounded-full bg-rose text-ink font-semibold hover:bg-rose-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
