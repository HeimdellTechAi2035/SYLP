"use client";
import { useActionState } from "react";
import Link from "next/link";
import { inviteStaff, acceptStaffInvite, resendStaffInvite } from "@/lib/actions/admin/staff";
export default function StaffForm({ token }: { token?: string }) {
 const [state, action, pending] = useActionState(token !== undefined ? acceptStaffInvite : inviteStaff, { message: "" });
 return <form action={action} className="space-y-4 max-w-lg rounded-xl bg-blush p-5">
 {token !== undefined ? <><input type="hidden" name="token" value={token} /><label className="block">Choose your password<input className="block w-full border rounded-lg p-3 text-base" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label></> : <><label className="block">Staff name<input className="block w-full border rounded-lg p-3 text-base" name="name" maxLength={100} required /></label><label className="block">Staff email<input className="block w-full border rounded-lg p-3 text-base" name="email" type="email" required /></label></>}
 <button disabled={pending} className="min-h-11 rounded-lg bg-rose-dark px-5 disabled:opacity-50">{pending ? "Saving…" : token !== undefined ? "Activate my account" : "Create and email invitation"}</button>
 <p role="status">{state.message}</p>{state.link && <p className="break-all select-all text-sm">{typeof window !== "undefined" ? window.location.origin : ""}{state.link}</p>}{token !== undefined && state.success && <Link className="underline inline-flex min-h-11 items-center" href="/admin/login">Sign in</Link>}
 </form>;
}

export function ResendStaffInvitation({ id }: { id: string }) {
 const [state, action, pending] = useActionState(resendStaffInvite.bind(null,id), { message: "" });
 return <form action={action} className="my-3 space-y-2"><p className="text-xs">Resending creates a new private link and invalidates the previous invitation.</p><button disabled={pending} className="min-h-11 rounded-lg bg-rose-dark px-4 disabled:opacity-50">{pending ? "Sending…" : "Resend invitation email"}</button><p role="status" className="text-sm">{state.message}</p>{state.link && <p className="text-sm break-all select-all">{typeof window !== "undefined" ? window.location.origin : ""}{state.link}</p>}</form>;
}
