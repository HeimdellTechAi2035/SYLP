import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { setMessageStatus } from "@/lib/actions/admin/messages";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="Contact Messages" />
      <div className="space-y-3">
        {messages.map((msg) => {
          const markRead = setMessageStatus.bind(null, msg.id, "READ");
          const markResponded = setMessageStatus.bind(null, msg.id, "RESPONDED");
          return (
            <div key={msg.id} className="bg-white rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{msg.name} &middot; <span className="text-ink-soft font-normal">{msg.email}</span></p>
                  <p className="text-xs text-ink-soft">{msg.category}{msg.orderNumber && ` · Order ${msg.orderNumber}`} &middot; {msg.createdAt.toLocaleString("en-GB")}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${msg.status === "RESPONDED" ? "bg-sage/20 text-sage" : msg.status === "READ" ? "bg-ink/10 text-ink-soft" : "bg-gold/20 text-ink"}`}>
                  {msg.status}
                </span>
              </div>
              <p className="text-sm text-ink-soft mb-3 whitespace-pre-line">{msg.message}</p>
              <div className="flex gap-2">
                {msg.status === "NEW" && <form action={markRead}><button type="submit" className="text-xs px-3 py-1.5 rounded-full bg-ink/10 text-ink-soft">Mark Read</button></form>}
                {msg.status !== "RESPONDED" && <form action={markResponded}><button type="submit" className="text-xs px-3 py-1.5 rounded-full bg-sage text-white">Mark Responded</button></form>}
                <a href={`mailto:${msg.email}`} className="text-xs px-3 py-1.5 rounded-full bg-ink text-cream">Reply by Email</a>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="text-ink-soft">No messages yet.</p>}
      </div>
    </div>
  );
}
