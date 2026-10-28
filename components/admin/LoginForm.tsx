"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminLoginState } from "@/lib/actions/admin-auth";

const initialState: AdminLoginState = { status: "idle" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} aria-describedby="admin-email-help" required className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
        <p id="admin-email-help" className="text-xs text-ink-soft mt-1">Use your owner email or the email that received your staff invitation.</p>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" aria-describedby="admin-password-help" required className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
      </div>
      <p id="admin-password-help" className="text-xs text-ink-soft">Use your own password. Staff must activate their latest invitation first, then use the password they chose.</p>
      {state.status === "error" && <p className="text-rose-dark text-sm">{state.message}</p>}
      <button type="submit" disabled={pending} className="w-full py-3 rounded-full bg-rose-dark text-ink font-semibold disabled:opacity-60">
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
