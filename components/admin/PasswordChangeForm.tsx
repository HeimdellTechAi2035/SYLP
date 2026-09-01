"use client";

import { useActionState } from "react";
import { changeAdminPassword, type PasswordState } from "@/lib/actions/admin/settings";

const initialState: PasswordState = { status: "idle" };

export default function PasswordChangeForm() {
  const [state, formAction, pending] = useActionState(changeAdminPassword, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" required className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-1">New password</label>
        <input id="newPassword" name="newPassword" type="password" required minLength={8} className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      {state.status !== "idle" && (
        <p className={`text-sm ${state.status === "success" ? "text-sage" : "text-rose-dark"}`}>{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="px-6 py-2.5 rounded-full bg-rose-dark text-cream font-semibold text-sm disabled:opacity-60">
        {pending ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}
