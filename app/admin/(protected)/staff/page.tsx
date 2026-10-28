import { requireOwnerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StaffForm from "@/components/admin/StaffForms";
import { disableStaff } from "@/lib/actions/admin/staff";
export default async function StaffPage() {
 await requireOwnerSession();
 const staff = await prisma.adminUser.findMany({ where: { role: "STAFF" }, select: { id: true, name: true, email: true, active: true, inviteExpiresAt: true }, orderBy: { createdAt: "desc" } });
 const logs = await prisma.auditLog.findMany({ where: { OR: [{ action: { startsWith: "staff." } }, { action: { startsWith: "support." } }, { action: "community.view" }, { action: "evidence.download" }, { action: "order.status_change" }] }, include: { adminUser: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 });
 return <div><h1 className="text-2xl mb-4">Staff access</h1><p className="mb-5">Staff can process orders, enquiries and confidential submissions. Website settings, refunds, deletion and exports remain owner-only. Invitations also reset existing staff access; previous sessions are ended immediately.</p><StaffForm /><div className="space-y-3 my-6">{staff.map(user => <article key={user.id} className="rounded-xl bg-blush p-5 break-words"><p>{user.name} · {user.email}</p><p className="text-sm">{user.active ? "Active" : user.inviteExpiresAt && user.inviteExpiresAt > new Date() ? "Invitation pending" : "Disabled"}</p><form action={disableStaff.bind(null,user.id)}><button className="min-h-11 underline">Disable access / revoke invitation</button></form></article>)}</div><h2 className="text-xl mb-4">Recent staff and service activity</h2><ul className="space-y-2 text-sm">{logs.map(log => <li className="rounded-lg bg-blush p-3 break-words" key={log.id}>{log.createdAt.toLocaleString("en-GB")} · {log.adminUser?.name ?? "Former user"} · {log.action} · {log.entityId ?? log.detail}</li>)}</ul></div>;
}
