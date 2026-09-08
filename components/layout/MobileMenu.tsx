"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

const noopSubscribe = () => () => {};

/** True only once mounted on the client — the portal target (document.body) doesn't exist during SSR. */
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export default function MobileMenu({
  links,
  categoryLinks,
}: {
  links: { label: string; href: string }[];
  categoryLinks?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    // Lock background scroll while the drawer covers the screen, and restore
    // it on close/unmount regardless of how the drawer was dismissed.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    openButtonRef.current?.focus();
  }

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="p-2 -ml-2 rounded-full hover:bg-blush"
      >
        <Menu className="h-6 w-6 text-ink" />
      </button>

      {/* Rendered via portal straight into <body> — this drawer must never be
          a descendant of the sticky header, which uses backdrop-blur.
          backdrop-filter (like transform) makes its element the containing
          block for `position: fixed` descendants, so a fixed overlay nested
          inside it collapses to the header's own small box instead of
          covering the viewport, letting page content behind it show through.
          Portaling to <body> sidesteps that entirely. */}
      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-ink/40"
            onClick={close}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-cream shadow-xl p-6 flex flex-col gap-1 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-lg text-ink">Menu</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="p-2 rounded-full hover:bg-blush"
                >
                  <X className="h-5 w-5 text-ink" />
                </button>
              </div>
              {links.map((link, i) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="block py-3 border-b border-ink/10 text-ink font-medium"
                  >
                    {link.label}
                  </Link>
                  {/* Categories collapse under the first link ("Shop All")
                      rather than listing all of them flat — same overflow
                      fix as the desktop ShopDropdown, adapted for a drawer. */}
                  {i === 0 && categoryLinks && categoryLinks.length > 0 && (
                    <details className="border-b border-ink/10">
                      <summary className="py-3 text-ink-soft font-medium cursor-pointer list-none flex items-center justify-between">
                        Categories
                        <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                      </summary>
                      <div className="pb-2 pl-4 flex flex-col">
                        {categoryLinks.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            onClick={close}
                            className="py-2 text-ink-soft"
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
