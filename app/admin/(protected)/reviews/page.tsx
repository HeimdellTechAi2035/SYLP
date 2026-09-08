import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StarRating from "@/components/ui/StarRating";
import { setReviewStatus, respondToReview } from "@/lib/actions/admin/reviews";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } },
  });

  return (
    <div>
      <AdminPageHeader title="Reviews" />
      <div className="space-y-4">
        {reviews.map((review) => {
          const approve = setReviewStatus.bind(null, review.id, "APPROVED");
          const reject = setReviewStatus.bind(null, review.id, "REJECTED");
          const respond = respondToReview.bind(null, review.id);
          return (
            <div key={review.id} className="bg-blush rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <StarRating rating={review.rating} />
                  <p className="font-medium mt-1">{review.title || "(No title)"}</p>
                  <p className="text-xs text-ink-soft">{review.product.name} &middot; {review.customerName} &middot; {review.customerEmail}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${review.status === "APPROVED" ? "bg-sage/20 text-sage" : review.status === "REJECTED" ? "bg-ink/10 text-ink-soft" : "bg-gold/20 text-ink"}`}>
                  {review.status}
                </span>
              </div>
              <p className="text-sm text-ink-soft mb-3">{review.body}</p>
              {review.verifiedPurchase && <p className="text-xs text-sage mb-3">Verified purchase</p>}

              <div className="flex gap-2 mb-3">
                {review.status !== "APPROVED" && (
                  <form action={approve}><button type="submit" className="text-xs px-3 py-1.5 rounded-full bg-sage text-ink">Approve</button></form>
                )}
                {review.status !== "REJECTED" && (
                  <form action={reject}><button type="submit" className="text-xs px-3 py-1.5 rounded-full bg-ink/10 text-ink-soft">Reject</button></form>
                )}
              </div>

              <form action={respond} className="flex gap-2">
                <input
                  name="merchantResponse"
                  defaultValue={review.merchantResponse ?? ""}
                  placeholder="Write a public response (optional)"
                  className="flex-1 rounded-lg border border-ink/15 px-3 py-1.5 text-sm"
                />
                <button type="submit" className="text-xs px-3 py-1.5 rounded-full bg-rose-dark text-ink">Save Response</button>
              </form>
            </div>
          );
        })}
        {reviews.length === 0 && <p className="text-ink-soft">No reviews yet.</p>}
      </div>
    </div>
  );
}
