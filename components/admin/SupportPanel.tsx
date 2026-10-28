import { cache } from "react";
import { randomUUID } from "node:crypto";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupportRecord } from "@/lib/support-record";
import { emailProviderConfigured } from "@/lib/email/provider";
import SupportForms from "./SupportForms";
const activeStaff = cache(() => prisma.adminUser.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }));
export default async function SupportPanel({ entityType, entityId }: { entityType: string; entityId: string }) {
 await requireAdminSession();
 const record = await getSupportRecord(entityType,entityId); if (!record) return null;
 const [task, staff, entries] = await Promise.all([prisma.supportTask.findUnique({ where: { entityType_entityId: { entityType, entityId } } }), activeStaff(), prisma.supportEntry.findMany({ where: { entityType, entityId }, orderBy: { createdAt: "desc" }, take: 50 })]);
 return <details className="rounded-xl border border-ink/20 p-4 my-5 min-w-0"><summary className="min-h-11 cursor-pointer text-lg font-semibold">Customer service: notes, follow-ups and replies</summary><div className="mt-4"><SupportForms entityType={entityType} entityId={entityId} task={task ? { assignedTo: task.assignedTo, date: task.followUpAt?.toISOString().slice(0,10) ?? "" } : null} staff={staff} recipient={record.recipient} reference={record.reference} configured={emailProviderConfigured()} attempt={randomUUID()} /><h4 className="font-semibold mt-5 mb-3">Recent history</h4>{entries.length === 0 && <p className="text-sm">No notes or replies yet.</p>}<ul className="space-y-3">{entries.map(entry => <li className="rounded-lg bg-ink/5 p-3 text-sm" key={entry.id}><p className="font-medium">{entry.authorName} · {entry.kind} · {entry.status} · {entry.createdAt.toLocaleString("en-GB")}</p>{entry.subject && <p>{entry.subject}</p>}<p className="whitespace-pre-wrap break-words">{entry.body}</p></li>)}</ul></div></details>;
}
