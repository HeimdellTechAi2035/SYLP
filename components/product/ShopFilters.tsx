import Link from "next/link";
import SortSelect from "@/components/product/SortSelect";

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default function ShopFilters({
  categories,
  activeCategory,
  q,
  sort,
}: {
  categories: { name: string; slug: string }[];
  activeCategory?: string;
  q?: string;
  sort?: string;
}) {
  const base = { category: activeCategory, q, sort };

  return (
    <aside className="space-y-8">
      <div>
        <SortSelect base={base} />
      </div>

      <div>
        <h2 className="font-semibold text-sm mb-3">Category</h2>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link
              href={buildHref(base, { category: undefined })}
              className={!activeCategory ? "text-rose-dark font-semibold" : "text-ink-soft hover:text-ink"}
            >
              All
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={buildHref(base, { category: cat.slug })}
                className={activeCategory === cat.slug ? "text-rose-dark font-semibold" : "text-ink-soft hover:text-ink"}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
