import { prisma } from "@/lib/prisma";
import { parseCommunityRecord } from "@/lib/community/records";
import { z } from "zod";
export async function getSupportRecord(entityType: string, id: string) {
 if (entityType === "Order") { const order = await prisma.order.findUnique({ where: { id }, select: { email: true, orderNumber: true } }); return order && { recipient: z.email().safeParse(order.email).success ? order.email : null, reference: order.orderNumber }; }
 if (entityType === "ContactMessage") { const message = await prisma.contactMessage.findUnique({ where: { id } }); if (!message) return null; const community = message.category.startsWith("Community: "); const record = community ? parseCommunityRecord(message.message) : null; const email = community ? record?.data.anonymous ? null : record?.data.email : message.email; return { recipient: email && z.email().safeParse(email).success ? email : null, reference: record?.reference ?? "Your enquiry" }; }
 return null;
}
