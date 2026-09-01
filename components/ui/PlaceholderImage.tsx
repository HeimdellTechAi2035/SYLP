import { Flame } from "lucide-react";

/** Warm placeholder used wherever a real product/lifestyle photo hasn't been uploaded yet. */
export default function PlaceholderImage({ label }: { label?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blush to-cream-dark text-rose-dark/60">
      <Flame className="h-8 w-8" aria-hidden />
      <span className="text-[11px] uppercase tracking-wide font-medium">
        {label ?? "Image coming soon"}
      </span>
    </div>
  );
}
