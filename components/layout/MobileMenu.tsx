"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronDown, Search, Shield } from "lucide-react";

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
  divisionLinks,
}: {
  links: { label: string; href: string }[];
  categoryLinks?: { label: string; href: string }[];
  divisionLinks?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    // Lock background scroll while the drawer covers the screen, and restore
    // it on close/unmount regardless of how the drawer was dismissed.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); openButtonRef.current?.focus(); }
      if (e.key === "Tab") {
        const controls = [...(drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button, input, summary') ?? [])].filter(el => el.getClientRects().length > 0);
        const first = controls[0]; const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
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
        className="min-h-11 min-w-11 p-2 -ml-2 rounded-full hover:bg-blush"
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
              ref={drawerRef}
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
                  className="min-h-11 min-w-11 p-2 rounded-full hover:bg-blush"
                >
                  <X className="h-5 w-5 text-ink" />
                </button>
              </div>
              <form action="/shop" className="relative mb-3" onSubmit={() => setOpen(false)}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" aria-hidden />
                <input
                  type="search"
                  name="q"
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full pl-9 pr-3 py-2.5 rounded-full bg-blush border border-ink/20 text-ink placeholder:text-ink/50 text-sm outline-none focus:ring-2 focus:ring-rose"
                />
              </form>
              {divisionLinks && divisionLinks.length > 0 && (
                <div className="mb-2">
                  <p className="text-[11px] uppercase tracking-wide text-ink-soft pt-1 pb-1">Divisions</p>
                  {divisionLinks.map((d) => (
                    <a
                      key={d.href}
                      href={d.href}
                      onClick={close}
                      className="flex items-center gap-2 py-2.5 border-b border-ink/10 text-ink font-medium"
                    >
                      <Shield className="h-4 w-4 text-rose shrink-0" aria-hidden />
                      {d.label}
                    </a>
                  ))}
                </div>
              )}
              {links.map((link, i) => (
                <div key={link.href}>
                  <a
                    href={link.href}
                    onClick={close}
                    className="block py-3 border-b border-ink/10 text-ink font-medium"
                  >
                    {link.label}
                  </a>
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
                          <a
                            key={cat.href}
                            href={cat.href}
                            onClick={close}
                            className="py-2 text-ink-soft"
                          >
                            {cat.label}
                          </a>
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
