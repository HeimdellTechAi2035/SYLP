"use client";

import { useActionState } from "react";
import { updateAccountSettings, type SettingsState } from "@/lib/actions/account-settings";

const initialState: SettingsState = { status: "idle" };

export default function SettingsForm({
  customer,
}: {
  customer: { firstName: string | null; lastName: string | null; phone: string | null; email: string };
}) {
  const [state, formAction, pending] = useActionState(updateAccountSettings, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input value={customer.email} disabled className="w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-ink/5 text-ink-soft" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">First name</label>
          <input id="firstName" name="firstName" defaultValue={customer.firstName ?? ""} className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last name</label>
          <input id="lastName" name="lastName" defaultValue={customer.lastName ?? ""} className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
        <input id="phone" name="phone" defaultValue={customer.phone ?? ""} className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-1">New password (optional)</label>
        <input id="newPassword" name="newPassword" type="password" minLength={8} className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
      </div>
      {state.status !== "idle" && (
        <p className={`text-sm ${state.status === "success" ? "text-sage" : "text-rose-dark"}`}>{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="px-6 py-2.5 rounded-full bg-rose-dark text-cream font-semibold disabled:opacity-60">
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
