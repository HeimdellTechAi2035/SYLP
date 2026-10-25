"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Send } from "lucide-react";
import { sendChatMessage } from "@/lib/actions/chat";
import type { ChatLink } from "@/lib/knowledge/chat";
import { isCommunityPath } from "@/lib/community/config";

type Message = { role: "bot" | "user"; text: string; links?: ChatLink[] };

const MAX_INPUT_LENGTH = 500;

const QUICK_ACTIONS = [
  { label: "Our cause", message: "What is SYLP and your cause?" },
  { label: "Shop products", message: "What do you sell?" },
  { label: "Get involved", message: "How can I volunteer?" },
  { label: "Report an incident", message: "How do I report an incident?" },
  { label: "Help the homeless", message: "How can I help the homeless?" },
  { label: "Support our work", message: "How can I donate money?" },
  { label: "Delivery & returns", message: "How much is delivery?" },
  { label: "Contact us", message: "How can I contact you?" },
];

const GREETING =
  "Hi 👋 I'm the SYLP assistant. Ask me about our cause, merchandise, volunteering, incident reporting, homeless donations or supporting our work. I can also help with delivery, returns and orders. Please use the dedicated forms for confidential information.";

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [awaitingOrderVerification, setAwaitingOrderVerification] = useState(false);
  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const lastProductSlugRef = useRef<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Open only when requested, so the panel never interrupts mobile browsing.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (open && window.matchMedia("(min-width: 640px)").matches) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Never covers Add to Cart / Checkout / payment controls — simplest reliable
  // rule is to not render at all on the payment handoff page.
  if (pathname?.startsWith("/checkout") || (pathname && isCommunityPath(pathname))) return null;

  async function send(text: string, verification?: { orderNumber?: string; email?: string }) {
    if (!text.trim() || pending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setPending(true);
    try {
      const response = await sendChatMessage(text, { ...verification, lastProductSlug: lastProductSlugRef.current });
      lastProductSlugRef.current = response.subjectProductSlug ?? lastProductSlugRef.current;
      setMessages((m) => [...m, { role: "bot", text: response.text, links: response.links }]);
      setAwaitingOrderVerification(response.text.includes("please tell me your order number"));
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, something went wrong. Please try again in a moment." }]);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function submitOrderVerification(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumberInput.trim() || !emailInput.trim()) return;
    send(`Order ${orderNumberInput}`, { orderNumber: orderNumberInput, email: emailInput });
    setAwaitingOrderVerification(false);
  }

  return (
    // z-[60]: above the cookie-consent bar (z-50), which is full-width and
    // otherwise sits directly on top of this corner until the visitor
    // responds to it.
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 sm:right-4 z-[60] flex flex-col items-end">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Support Your Local Patriot chat assistant"
          className="mb-2 w-[min(20rem,calc(100vw-1.5rem))] h-[22rem] max-h-[min(55dvh,calc(100dvh-5rem))] sm:w-96 sm:h-[28rem] sm:max-h-[70dvh] bg-cream rounded-2xl shadow-xl flex flex-col overflow-hidden border border-ink/20"
        >
          <div className="flex items-center justify-between px-3 py-2 shrink-0 bg-rose-dark text-ink">
            <span className="font-display text-sm">SYLP Assistant</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
              }}
              aria-label="Close chat"
              className="min-h-11 min-w-11 flex items-center justify-center text-ink/80 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} role="log" aria-live="polite" aria-label="Conversation" className="flex-1 min-h-0 overscroll-contain overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <p
                  className={`inline-block rounded-xl px-3 py-2 max-w-[85%] whitespace-pre-line border ${
                    m.role === "user" ? "bg-rose-dark text-ink border-ink/20" : "bg-blush text-ink border-ink/10"
                  }`}
                >
                  <span className="sr-only">{m.role === "user" ? "You said: " : "Assistant said: "}</span>
                  {m.text}
                </p>
                {m.links && m.links.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2 justify-start">
                    {m.links.map((link) => (
                      <Link key={link.href} href={link.href} className="text-xs underline text-rose-dark">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {awaitingOrderVerification && (
              <form onSubmit={submitOrderVerification} className="space-y-2 bg-blush rounded-xl p-3 border border-ink/10">
                <label htmlFor="chat-order-number" className="sr-only">Order number</label>
                <input
                  id="chat-order-number"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder="Order number (e.g. HM-1001)"
                  className="w-full rounded-lg border border-ink/20 px-2 py-1.5 text-base text-ink placeholder:text-ink/50"
                />
                <label htmlFor="chat-order-email" className="sr-only">Email used at checkout</label>
                <input
                  id="chat-order-email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  type="email"
                  placeholder="Email used at checkout"
                  className="w-full rounded-lg border border-ink/20 px-2 py-1.5 text-base text-ink placeholder:text-ink/50"
                />
                <button type="submit" className="w-full rounded-lg bg-rose-dark text-ink text-xs py-1.5 font-medium">
                  Check order
                </button>
              </form>
            )}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => send(action.message)}
                    className="text-xs px-3 py-1.5 rounded-full border border-ink/15 hover:bg-blush"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 p-2 border-t border-ink/10">
            <label htmlFor="chat-message-input" className="sr-only">Ask a question</label>
            <input
              id="chat-message-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              maxLength={MAX_INPUT_LENGTH}
              className="flex-1 min-w-0 rounded-full border border-ink/15 px-3 py-2 text-base"
              disabled={pending}
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send"
              className="min-h-11 min-w-11 flex items-center justify-center p-2 rounded-full bg-rose-dark text-ink disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
        }}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-dark text-ink border-2 border-ink/20 shadow-lg flex items-center justify-center hover:bg-rose transition-colors"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
