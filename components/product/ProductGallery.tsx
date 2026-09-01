"use client";

import { useState } from "react";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-blush">
        {hasImages ? (
          <Image src={images[active]} alt={name} fill priority className="object-cover" />
        ) : (
          <PlaceholderImage />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              aria-current={active === i}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${active === i ? "border-rose-dark" : "border-transparent"}`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
