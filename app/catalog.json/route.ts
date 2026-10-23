import { NextResponse } from "next/server";
import { buildCatalog } from "@/lib/catalog";

// Public, machine-readable product and store catalogue for search engines,
// AI assistants and agents. Only ever built from public knowledge.
export const revalidate = 300;

export async function GET() {
  const catalog = await buildCatalog();
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
