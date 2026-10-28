import { prisma } from "@/lib/prisma";
import { parseCommunityRecord } from "@/lib/community/records";
import { z } from "zod";
import type { ReplyContext, ReplyKind } from "@/lib/admin-replies";
export type SupportRecord = ReplyContext & { recipient: string | null };
export async function getSupportRecord(entityType: string, id: string): Promise<SupportRecord | null> {
 if (entityType === "Order") {
  const order=await prisma.order.findUnique({where:{id},select:{email:true,orderNumber:true,firstName:true,lastName:true,paymentStatus:true,fulfilmentStatus:true}});
  return order && {kind:"order",recipient:z.email().safeParse(order.email).success?order.email:null,reference:order.orderNumber,name:`${order.firstName} ${order.lastName}`.trim(),area:"",interest:"",anonymous:false,originalMessage:`Order ${order.orderNumber}. Payment: ${order.paymentStatus}. Fulfilment: ${order.fulfilmentStatus}. Check the items and tracking above before giving an update.`};
 }
 if (entityType !== "ContactMessage") return null;
 const message=await prisma.contactMessage.findUnique({where:{id}});if(!message)return null;
 const community=message.category.startsWith("Community: ");
 const record=community?parseCommunityRecord(message.message):null;
 const data=record?.data;
 const kind: ReplyKind=community ? data && ["register","incident","whistleblower","donation"].includes(data.kind) ? data.kind : "whistleblower" : "contact";
 const anonymous=community&&(!data||Boolean(data.anonymous));
 const email=community?anonymous?null:data?.email:message.email;
 return {kind,recipient:email&&z.email().safeParse(email).success?email:null,reference:record?.reference||message.orderNumber||`Enquiry ${message.id.slice(-8)}`,name:anonymous?"":community?data?.name??"":message.name,anonymous,area:kind==="register"||kind==="donation"?data?.area??"":"",interest:kind==="register"?data?.interest??"":"",originalMessage:community?data?.message??"This submission could not be displayed.":message.message};
}
