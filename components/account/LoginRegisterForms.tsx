"use client";

import { useActionState, useState } from "react";
import { loginCustomer, registerCustomer, type AuthFormState } from "@/lib/actions/customer-auth";

const initialState: AuthFormState = { status: "idle" };

export default function LoginRegisterForms() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginState, loginAction, loginPending] = useActionState(loginCustomer, initialState);
  const [registerState, registerAction, registerPending] = useActionState(registerCustomer, initialState);

  return (
    <div className="max-w-md">
      <div className="flex gap-6 border-b border-ink/10 mb-6">
        <TabButton active={tab === "login"} onClick={() => setTab("login")}>Sign In</TabButton>
        <TabButton active={tab === "register"} onClick={() => setTab("register")}>Create Account</TabButton>
      </div>

      {tab === "login" ? (
        <form action={loginAction} className="space-y-4">
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          {loginState.status === "error" && <p className="text-rose-dark text-sm">{loginState.message}</p>}
          <button type="submit" disabled={loginPending} className="w-full py-3 rounded-full bg-rose-dark text-cream font-semibold disabled:opacity-60">
            {loginPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        <form action={registerAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" name="firstName" required />
            <Field label="Last name" name="lastName" required />
          </div>
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required minLength={8} />
          {registerState.status === "error" && <p className="text-rose-dark text-sm">{registerState.message}</p>}
          <button type="submit" disabled={registerPending} className="w-full py-3 rounded-full bg-rose-dark text-cream font-semibold disabled:opacity-60">
            {registerPending ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}

      <p className="text-xs text-ink-soft mt-4">
        An account isn&apos;t required to order — guest checkout is always available.
      </p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-3 font-semibold text-sm border-b-2 -mb-px ${active ? "border-rose-dark text-ink" : "border-transparent text-ink-soft"}`}
    >
      {children}
    </button>
  );
}

function Field({ label, name, type = "text", required, minLength }: { label: string; name: string; type?: string; required?: boolean; minLength?: number }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <input id={name} name={name} type={type} required={required} minLength={minLength} className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
    </div>
  );
}
