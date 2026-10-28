import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBuyers } from "@/lib/queries/buyers";

// Admin-only download of every buyer as a spreadsheet (CSV). Not using
// requireAdminSession() because that redirects; an API should 401 instead.
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "OWNER" || session.mustChangePassword) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const division = request.nextUrl.searchParams.get("division") ?? undefined;
  const buyers = await getBuyers({ q, division });

  // Quote every cell, and neutralise anything a spreadsheet would run as a formula.
  const cell = (v: string | number | null | undefined) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Name", "Email", "Phone", "Address", "Postcode", "Orders", "Total spent (£)", "First order", "Last order", "Divisions", "Has account"],
    ...buyers.map((b) => [
      b.name, b.email, b.phone, b.address, b.postcode, b.orderCount, (b.totalSpent / 100).toFixed(2),
      b.firstOrderAt.toISOString().slice(0, 10), b.lastOrderAt.toISOString().slice(0, 10), b.divisions.join("; "), b.hasAccount ? "Yes" : "No",
    ]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="buyers-${division ?? "all"}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
