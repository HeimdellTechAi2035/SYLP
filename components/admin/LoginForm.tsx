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
        <input id="email" name="email" type="email" required className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input id="password" name="password" type="password" required className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
      </div>
      {state.status === "error" && <p className="text-rose-dark text-sm">{state.message}</p>}
      <button type="submit" disabled={pending} className="w-full py-3 rounded-full bg-rose-dark text-ink font-semibold disabled:opacity-60">
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
