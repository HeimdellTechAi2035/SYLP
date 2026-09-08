"use client";

import { useRouter } from "next/navigation";

export default function SortSelect({ base }: { base: Record<string, string | undefined> }) {
  const router = useRouter();

  return (
    <div>
      <label htmlFor="sort" className="font-semibold text-sm mb-2 block">
        Sort by
      </label>
      <select
        id="sort"
        defaultValue={base.sort ?? "newest"}
        onChange={(e) => {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(base)) {
            if (value && key !== "sort") params.set(key, value);
          }
          if (e.target.value !== "newest") params.set("sort", e.target.value);
          router.push(`/shop?${params.toString()}`);
        }}
        className="w-full rounded-lg border border-ink/15 bg-blush px-3 py-2 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}
