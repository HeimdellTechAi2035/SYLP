import SectionHeading from "@/components/home/SectionHeading";
import StarRating from "@/components/ui/StarRating";

export type HomeReview = {
  id: string;
  customerName: string;
  rating: number;
  title: string | null;
  body: string;
  product: { name: string; slug: string };
};

export default function ReviewsSection({ reviews }: { reviews: HomeReview[] }) {
  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Customer reviews" title="What people are saying" align="center" />
      {reviews.length === 0 ? (
        <p className="text-center text-ink-soft max-w-md mx-auto">
          We&apos;re just getting started — genuine customer reviews will appear here once orders come in.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl bg-blush/70 p-6 border border-ink/5">
              <StarRating rating={review.rating} />
              {review.title && <h3 className="font-medium mt-2">{review.title}</h3>}
              <p className="text-sm text-ink-soft mt-2 line-clamp-4">{review.body}</p>
              <p className="text-xs text-ink-soft/70 mt-3">
                {review.customerName} &middot; {review.product.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
