import { buildCatalog, catalogToLlmsFull } from "@/lib/catalog";

// The full product catalogue and FAQ as Markdown, for AI assistants.
export const revalidate = 300;

export async function GET() {
  const body = catalogToLlmsFull(await buildCatalog());
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" },
  });
}
