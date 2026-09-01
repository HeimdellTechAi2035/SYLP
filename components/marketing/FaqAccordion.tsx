"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqEntry = { id: string; question: string; answer: string };

export default function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-4 py-4 text-left font-medium"
            >
              {item.question}
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {open && <p className="pb-4 text-sm text-ink-soft">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
