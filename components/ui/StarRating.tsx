import { Star } from "lucide-react";

export default function StarRating({
  rating,
  count,
  size = 16,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < rounded ? "fill-gold text-gold" : "text-ink/20"}
          />
        ))}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-ink-soft">({count})</span>
      )}
    </div>
  );
}
