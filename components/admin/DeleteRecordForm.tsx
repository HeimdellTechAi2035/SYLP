"use client";
import { useActionState } from "react";

export default function DeleteRecordForm({ action, label = "Delete", description }: { action: () => Promise<void>; label?: string; description: string }) {
  const [error, submit, pending] = useActionState(async () => {
    try { await action(); return ""; } catch { return "Could not delete this item. Refresh and try again."; }
  }, "");
  return <form action={submit} onSubmit={event => { if (!window.confirm(description)) event.preventDefault(); }}>
    <button type="submit" disabled={pending} className="min-h-11 rounded-lg border border-red-700/40 px-4 py-2 text-sm text-red-800 disabled:opacity-50">{pending ? "Deleting…" : label}</button>
    {error && <p role="alert" className="text-sm text-red-800 mt-2">{error}</p>}
  </form>;
}
