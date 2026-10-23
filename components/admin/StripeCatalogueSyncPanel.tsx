"use client";

import { useState, useTransition } from "react";
import { checkStripeCatalogueAction, fixStripeCatalogueBatch } from "@/lib/actions/admin/stripe-catalogue-sync";
import type { CatalogueCheck } from "@/lib/stripe-reconcile";

/**
 * Stripe catalogue check. Nothing runs on page load: "Check Stripe" compares
 * every product with Stripe (read-only), then "Fix all" sends the fixes a few
 * products at a time and checks again at the end.
 */
export default function StripeCatalogueSyncPanel({
  totalSellable,
  needsSync,
}: {
  totalSellable: number;
  needsSync: number;
}) {
  const [pending, startTransition] = useTransition();
  const [check, setCheck] = useState<CatalogueCheck | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const runCheck = () =>
    startTransition(async () => {
      setErrors([]);
      setProgress(null);
      try {
        setCheck(await checkStripeCatalogueAction());
      } catch {
        setErrors(["Couldn't reach Stripe. Try again in a minute."]);
      }
    });

  const fixAll = () =>
    startTransition(async () => {
      if (!check) return;
      const todo = check.problems.map((p) => ({ productId: p.productId, priceProblem: p.priceProblem }));
      const names = new Map(check.problems.map((p) => [p.productId, p.name]));
      const errs: string[] = [];
      for (let i = 0; i < todo.length; i += 5) {
        setProgress(`Fixing ${Math.min(i + 5, todo.length)} of ${todo.length}…`);
        try {
          const res = await fixStripeCatalogueBatch(todo.slice(i, i + 5));
          for (const f of res.failed) errs.push(`${names.get(f.productId) ?? f.productId}: ${f.error}`);
        } catch {
          errs.push("A batch didn't finish. Press Check Stripe again to see what's left.");
          break;
        }
      }
      setErrors(errs);
      setProgress("Checking again…");
      try {
        setCheck(await checkStripeCatalogueAction());
      } finally {
        setProgress(null);
      }
    });

  const allGood = check && check.configured && check.problems.length === 0;

  return (
    <section className={`rounded-xl p-4 mb-6 ${allGood ? "bg-sage/10" : "bg-gold/10"}`} aria-labelledby="stripe-check">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 id="stripe-check" className="font-semibold">Stripe catalogue</h2>
          <p className="text-sm text-ink-soft">
            {check
              ? !check.configured
                ? "Stripe isn't set up on this server."
                : allGood
                  ? `All ${check.checked} products match Stripe (${check.mode} mode).`
                  : `${check.matching} of ${check.checked} match Stripe (${check.mode} mode). ${check.problems.length} need fixing.`
              : needsSync > 0
                ? `${needsSync} of ${totalSellable} live products haven't been sent to Stripe yet.`
                : `Check that every product and price in Stripe matches the shop.`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={runCheck}
            className="px-4 py-2.5 rounded-full bg-blush border border-ink/10 text-sm font-medium disabled:opacity-60"
          >
            {pending && !progress ? "Checking…" : "Check Stripe"}
          </button>
          {check && check.problems.length > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={fixAll}
              className="px-4 py-2.5 rounded-full bg-rose-dark text-ink text-sm font-semibold disabled:opacity-60"
            >
              {progress ?? `Fix all ${check.problems.length}`}
            </button>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="mt-3 text-sm text-rose-dark list-disc pl-5">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      {check && check.problems.length > 0 && (
        <details className="mt-3 text-sm" open={check.problems.length <= 10}>
          <summary className="cursor-pointer font-medium">What doesn&apos;t match</summary>
          <ul className="mt-2 space-y-2">
            {check.problems.map((p) => (
              <li key={p.productId} className="bg-blush rounded-lg px-3 py-2">
                <span className="font-medium">{p.name}</span>
                {p.status !== "ACTIVE" && <span className="text-ink-soft"> ({p.status.toLowerCase()})</span>}
                <span className="block text-ink-soft">{p.problems.join(" · ")}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {check && check.extras.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium">
            {check.extras.length} product{check.extras.length === 1 ? "" : "s"} in Stripe not linked to the shop
          </summary>
          <p className="mt-2 text-ink-soft">
            Left alone in case you use them for payment links. Archive them in the Stripe dashboard if you don&apos;t need them.
          </p>
          <ul className="mt-2 list-disc pl-5">
            {check.extras.map((e) => <li key={e.id}>{e.name}</li>)}
          </ul>
        </details>
      )}
    </section>
  );
}
