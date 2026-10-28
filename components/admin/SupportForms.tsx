"use client";
import { useActionState, useId, useState } from "react";
import { saveSupportTask, sendSupportReply } from "@/lib/actions/admin/support";
import { quickReplies, type ReplyContext, type QuickReply } from "@/lib/admin-replies";
export type SupportFormTask = { assignedTo: string | null; date: string; area: string; helpInterest: string };
export type SupportFormsProps = { entityType: string; entityId: string; task: SupportFormTask | null; staff: { id: string; name: string }[]; recipient: string | null; context: ReplyContext; configured: boolean; attempt: string };
export default function SupportForms({ entityType, entityId, task, staff, recipient, context, configured, attempt }: SupportFormsProps) {
 const [saved,save,saving]=useActionState(saveSupportTask.bind(null,entityType,entityId),{message:""});
 const [draft,setDraft]=useState("");
 const [messageAttempt,setMessageAttempt]=useState(attempt);
 const [pendingTemplate,setPendingTemplate]=useState<QuickReply|null>(null);
 const [selectedTip,setSelectedTip]=useState("");
 const [sent,send,sending]=useActionState(async(previous:{message:string;success?:boolean},form:FormData)=>{
  const result=await sendSupportReply(entityType,entityId,previous,form);
  if(result.success){setDraft("");setSelectedTip("");setPendingTemplate(null);setMessageAttempt(crypto.randomUUID());}
  return result;
 },{message:""});
 const field="block w-full rounded-lg border border-ink/20 bg-blush p-3 text-base mt-1";
 const canRecordArea=["register","donation","contact"].includes(context.kind)&&!context.anonymous;
 const canRecordInterest=["register","contact"].includes(context.kind)&&!context.anonymous;
 const fieldId=useId();
 function apply(reply:QuickReply){setDraft(reply.body);setSelectedTip(reply.tip);setPendingTemplate(null);}
 return <div className="grid xl:grid-cols-2 gap-6 min-w-0">
  <form action={save} className="space-y-4 min-w-0">
   <h4 className="font-semibold">Details, notes and follow-up</h4>
   {canRecordArea&&<label className="block text-sm">Area<input name="area" maxLength={120} defaultValue={task?.area??context.area} placeholder="Town or postcode area, e.g. Preston / PR1" className={field}/><span className="block text-xs text-ink-soft mt-1">Record the area they told us. A full home address is not needed.</span></label>}
   {canRecordInterest&&<label className="block text-sm">How they would like to help<textarea name="helpInterest" maxLength={500} rows={3} defaultValue={task?.helpInterest??context.interest} placeholder="Interests, practical skills and availability" className={field}/><span className="block text-xs text-ink-soft mt-1">Use their own answer. Save skills and availability here when they reply.</span></label>}
   <label className="block text-sm">Assigned to<select name="assignedTo" defaultValue={task?.assignedTo??""} className={field}><option value="">Unassigned</option>{staff.map(user=><option key={user.id} value={user.id}>{user.name}</option>)}</select><span className="block text-xs text-ink-soft mt-1">Choose the team member responsible for the next action.</span></label>
   <label className="block text-sm">Follow-up date<input name="followUpAt" type="date" defaultValue={task?.date??""} className={field}/><span className="block text-xs text-ink-soft mt-1">Set a date when waiting for a reply or further action. It appears in Follow-ups. Clear it when finished.</span></label>
   <label className="block text-sm">Add internal note<textarea name="note" maxLength={10000} rows={3} className={field}/><span className="block text-xs text-ink-soft mt-1">Private team history. Add what happened and the next action; this note is not emailed.</span></label>
   <button disabled={saving} className="min-h-11 rounded-lg bg-rose-dark px-4 disabled:opacity-50">{saving?"Saving…":"Save details and follow-up"}</button><p role="status" className="text-sm">{saved.message}</p>
  </form>
  <div className="min-w-0">
   {recipient?<form action={send} className="space-y-4">
    <h4 className="font-semibold">Quick reply to this message</h4><p className="text-sm break-all">To: {recipient}<br/>Linked reference: {context.reference}</p>
    {!configured&&<p role="alert" className="text-sm rounded-lg border border-gold/50 p-3">Business email needs configuring by the owner before replies can be sent. You can still prepare a draft and save internal notes.</p>}
    <fieldset><legend className="text-sm font-medium mb-2">Choose a draft, then review and edit</legend><div className="flex flex-wrap gap-2">{quickReplies(context).map(reply=><button key={reply.id} type="button" disabled={sending} onClick={()=>draft.trim()?setPendingTemplate(reply):apply(reply)} className="min-h-11 rounded-lg border border-ink/25 px-3 py-2 text-sm text-left disabled:opacity-50">{reply.label}</button>)}</div><p className="text-xs text-ink-soft mt-2">Choosing a quick reply only fills the message box. Nothing is sent until you press Send email.</p></fieldset>
    {pendingTemplate&&<div role="alert" className="rounded-lg border border-gold p-3 text-sm"><p>Replace your current draft with “{pendingTemplate.label}”?</p><div className="flex flex-wrap gap-3 mt-2"><button type="button" className="min-h-11 underline" onClick={()=>apply(pendingTemplate)}>Replace draft</button><button type="button" className="min-h-11 underline" onClick={()=>setPendingTemplate(null)}>Keep my draft</button></div></div>}
    {selectedTip&&<aside className="rounded-lg bg-gold/10 p-3 text-sm"><strong>Before sending: </strong>{selectedTip}</aside>}
    <input type="hidden" name="attempt" value={messageAttempt}/>
    <label className="block text-sm">Subject<input name="subject" disabled={sending} maxLength={200} required defaultValue={`SYLP — ${context.reference}`} className={field}/><span className="block text-xs text-ink-soft mt-1">Keep the reference so the recipient can recognise this enquiry.</span></label>
    <label htmlFor={`${fieldId}-body`} className="block text-sm">Message</label><textarea id={`${fieldId}-body`} name="body" required maxLength={10000} disabled={sending} rows={9} value={draft} onChange={event=>setDraft(event.target.value)} aria-describedby={`${fieldId}-reply-help`} className={field}/>
    <p id={`${fieldId}-reply-help`} className="text-xs text-ink-soft">Check names, facts and the recipient. The reply and reference are saved under this original record. Incoming replies go to the business email inbox; record any new area or interests here afterwards.</p>
    <button disabled={sending||!configured||!draft.trim()} className="min-h-11 rounded-lg bg-rose-dark px-5 disabled:opacity-50">{sending?"Sending…":"Send email"}</button><p role="status" className="text-sm">{sent.message}</p>
   </form>:<aside className="rounded-lg border border-ink/20 p-4 text-sm"><strong>No contact email supplied.</strong><p className="mt-2">An email reply is not possible. You can still review the submission, add an internal note and assign follow-up work. Do not try to identify an anonymous source.</p></aside>}
  </div>
 </div>;
}
