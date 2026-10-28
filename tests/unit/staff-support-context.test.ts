import { beforeEach,describe,it,expect,vi } from "vitest";
const m=vi.hoisted(()=>({message:vi.fn(),order:vi.fn()}));
vi.mock("@/lib/prisma",()=>({prisma:{contactMessage:{findUnique:m.message},order:{findUnique:m.order}}}));
import { getSupportRecord } from "@/lib/support-record";
beforeEach(()=>vi.clearAllMocks());
function community(data:Record<string,unknown>){return {id:"example",category:`Community: ${data.kind}`,message:JSON.stringify({version:1,reference:"SYLP-EXAMPLE",data,files:[],delivery:"NOT_REQUIRED"})};}
describe("support reply context",()=>{
 it("keeps registration area and interests beside its original message",async()=>{m.message.mockResolvedValue(community({kind:"register",name:"Example",email:"example@example.test",area:"Preston",interest:"Practical help",message:"I can help on Saturdays.",anonymous:false}));expect(await getSupportRecord("ContactMessage","example")).toMatchObject({kind:"register",area:"Preston",interest:"Practical help",reference:"SYLP-EXAMPLE",originalMessage:"I can help on Saturdays."});});
 it("does not turn anonymous contact details into a reply destination",async()=>{m.message.mockResolvedValue(community({kind:"whistleblower",anonymous:true,name:"Hidden",email:"hidden@example.test",message:"Private information"}));expect(await getSupportRecord("ContactMessage","example")).toMatchObject({recipient:null,name:"",anonymous:true});});
 it("does not mistake the incident location for the reporter's home area",async()=>{m.message.mockResolvedValue(community({kind:"incident",town:"Preston",area:"Manchester",anonymous:false,email:"example@example.test",message:"An incident occurred."}));expect(await getSupportRecord("ContactMessage","example")).toMatchObject({kind:"incident",area:"",interest:""});});
 it("does not include internal costs or Stripe data in order reply context",async()=>{m.order.mockResolvedValue({email:"example@example.test",orderNumber:"SYLP-123",firstName:"Example",lastName:"Buyer",paymentStatus:"PAID",fulfilmentStatus:"MAKING",costPrice:100,stripePaymentIntentId:"private"});const result=await getSupportRecord("Order","example");expect(result?.kind).toBe("order");expect(JSON.stringify(result)).not.toContain("stripePaymentIntentId");expect(JSON.stringify(result)).not.toContain("costPrice");expect(result?.originalMessage).toContain("MAKING");});
});
