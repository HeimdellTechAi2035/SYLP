"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function ShopDropdown({
  categories,
}: {
  categories: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  // Small delay on mouse-leave so moving from the trigger into the panel
  // (across the gap between them) doesn't close it prematurely.
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-ink-soft hover:text-rose-dark transition-colors"
      >
        Shop
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="w-64 max-h-[70vh] overflow-y-auto rounded-2xl border border-ink/10 bg-cream shadow-xl p-2">
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-blush transition-colors"
            >
              Shop All
            </Link>
            <div className="my-1 border-t border-ink/10" />
            {categories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-ink-soft hover:bg-blush hover:text-ink transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
