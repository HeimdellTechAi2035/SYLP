import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { askChatbot } from "@/lib/knowledge";
import { buildCatalog } from "@/lib/catalog";
import { clientIpFrom, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";
import { absUrl } from "@/lib/seo/site";
import { agentCard } from "@/lib/a2a";

/**
 * A2A (Agent2Agent protocol, v0.3) endpoint.
 *
 * GET  -> the Agent Card (also served at /.well-known/agent-card.json)
 * POST -> JSON-RPC 2.0, method "message/send"
 *
 * Answers come from the same deterministic, database-grounded assistant as
 * the on-site chat (lib/knowledge/chat.ts), plus structured product matches
 * from the public catalogue. Read-only: it never places orders, never sees
 * customer accounts (no session is ever attached), and only reveals an
 * order's status when given both the order number AND the matching email -
 * exactly what the public Track Your Order page requires.
 */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const MAX_TEXT = 500;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, A2A-Version",
};


type Part = { kind?: string; type?: string; text?: string; data?: Record<string, unknown> };

function rpcError(id: unknown, code: number, message: string, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status, headers: cors });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function GET() {
  return NextResponse.json(agentCard(), { headers: { ...cors, "Cache-Control": "public, max-age=3600" } });
}

export async function POST(request: NextRequest) {
  const ip = clientIpFrom(request.headers);
  const key = `a2a:${ip}`;
  if (isRateLimited(key, RATE_MAX, RATE_WINDOW_MS)) return rpcError(null, -32000, "Rate limit exceeded, try again shortly", 429);
  recordFailedAttempt(key, RATE_WINDOW_MS);

  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    const raw = await request.text();
    if (raw.length > 20_000) return rpcError(null, -32600, "Request too large");
    body = JSON.parse(raw);
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string") return rpcError(body?.id, -32600, "Invalid Request");

  if (body.method === "tasks/get" || body.method === "tasks/cancel") {
    return rpcError(body.id, -32001, "Task not found: this agent replies with messages, not long-running tasks");
  }
  if (body.method !== "message/send") return rpcError(body.id, -32601, "Method not found");

  const message = (body.params?.message ?? null) as { parts?: Part[]; contextId?: string; messageId?: string } | null;
  const parts = Array.isArray(message?.parts) ? message!.parts! : [];
  const text = parts
    .filter((p) => (p.kind ?? p.type) === "text" && typeof p.text === "string")
    .map((p) => p.text!)
    .join(" ")
    .slice(0, MAX_TEXT)
    .trim();
  const data = parts.find((p) => (p.kind ?? p.type) === "data" && p.data && typeof p.data === "object")?.data ?? {};
  if (!text) return rpcError(body.id, -32602, "Invalid params: message needs at least one text part");

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const answer = await askChatbot(text, {
    customerId: null, // never: A2A callers are anonymous
    orderNumber: str(data.orderNumber, 60),
    email: str(data.email, 200),
    lastProductSlug: str(data.productSlug, 120),
  });

  // Structured matches so the calling agent doesn't have to parse prose.
  const catalog = await buildCatalog();
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !STOP.has(w));
  const scored = catalog.products
    .map((p) => {
      const hay = `${p.name} ${p.division ?? ""} ${p.category ?? ""}`.toLowerCase();
      return { p, score: words.filter((w) => hay.includes(w.replace(/s$/, ""))).length };
    })
    .filter((s) => s.score > 0);
  const best = Math.max(0, ...scored.map((s) => s.score));
  const products = scored
    .filter((s) => s.score === best)
    .slice(0, 10)
    .map(({ p }) => ({
      name: p.name,
      division: p.division,
      category: p.category,
      price: p.price,
      available: p.available,
      sizes: p.options.map((o) => o.name),
      url: p.url,
      image: p.image,
    }));

  const result = {
    kind: "message",
    role: "agent",
    messageId: randomUUID(),
    contextId: typeof message?.contextId === "string" ? message.contextId.slice(0, 100) : randomUUID(),
    parts: [
      { kind: "text", text: answer.text },
      {
        kind: "data",
        data: {
          resolved: answer.resolved,
          links: answer.links.map((l) => ({ label: l.label, url: absUrl(l.href) })),
          products,
          ...(answer.subjectProductSlug ? { productSlug: answer.subjectProductSlug } : {}),
        },
      },
    ],
  };
  return NextResponse.json({ jsonrpc: "2.0", id: body.id ?? null, result }, { headers: cors });
}

const STOP = new Set([
  "the", "and", "for", "you", "your", "have", "what", "does", "how", "much", "are", "any", "with", "from", "this", "that",
  "can", "get", "want", "need", "show", "sell", "patriots", "patriot", "northwest", "merch", "please", "there", "got",
]);
