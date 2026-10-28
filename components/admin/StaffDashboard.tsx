import Link from "next/link";
import FormInboxOverview from "./FormInboxOverview";
export default function StaffDashboard() { return <div><h1 className="text-2xl mb-4">Customer service dashboard</h1><p className="mb-5">Manage orders and submissions. Keep confidential information within this dashboard.</p><div className="flex flex-wrap gap-4 mb-6"><Link className="rounded-xl bg-blush p-5 underline" href="/admin/orders">Orders and dispatch</Link><Link className="rounded-xl bg-blush p-5 underline" href="/admin/work">My follow-ups</Link></div><FormInboxOverview /></div>; }
