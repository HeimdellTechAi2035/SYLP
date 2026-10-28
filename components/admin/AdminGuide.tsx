"use client";
import { usePathname } from "next/navigation";
import { adminGuideFor } from "@/lib/admin-guidance";
export default function AdminGuide() {
 const guide=adminGuideFor(usePathname());
 return <aside aria-label="Help for this page" className="mb-6 rounded-xl border border-gold/35 bg-gold/5 p-4"><h2 className="font-semibold mb-2">{guide.title}</h2><ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">{guide.steps.map(step=><li key={step}>{step}</li>)}</ol></aside>;
}
