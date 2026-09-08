import { Flame } from "lucide-react";

/**
 * Branded fallback shown wherever a real product/lifestyle photo hasn't been
 * uploaded yet. Deliberately silent — no "add in Admin" / "coming soon" text
 * — customers should never see setup instructions; an admin missing-image
 * warning belongs in the admin UI itself, not here.
 */
export default function PlaceholderImage() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blush to-rose/40" aria-hidden>
      <Flame className="h-8 w-8 text-rose-dark/60" />
    </div>
  );
}
