import { buildCatalog, catalogToLlmsTxt } from "@/lib/catalog";

// llmstxt.org: a short, plain guide to this site for AI assistants.
export const revalidate = 300;

export async function GET() {
  const body = catalogToLlmsTxt(await buildCatalog());
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" },
  });
}
