"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustStock, transferStock } from "@/actions/inventory";

export function StockActions({ branchId, productId, branches }: { branchId: string; productId: string; branches: { id: string; label: string }[] }) {
  const router = useRouter();
  const [delta, setDelta] = useState("1");
  const [toBranch, setToBranch] = useState("");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>, okMsg: string) {
    setBusy(true); setMsg("");
    try { await fn(); setMsg(okMsg); router.refresh(); }
    catch (e) { setMsg((e as Error).message); }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        <input className="w-12 rounded border bg-background px-1 py-0.5 text-xs" value={delta} onChange={(e) => setDelta(e.target.value)} />
        <button className="text-[11px] text-emerald-600 dark:text-emerald-300 hover:underline" disabled={busy} onClick={() => run(() => adjustStock({ branchId, productId, delta: parseInt(delta) || 1, reason: "Manual adjustment (+)" }), "+ok")}>+</button>
        <button className="text-[11px] text-destructive hover:underline" disabled={busy} onClick={() => run(() => adjustStock({ branchId, productId, delta: -(parseInt(delta) || 1), reason: "Manual adjustment (-)" }), "-ok")}>−</button>
      </div>
      <span className="text-muted-foreground/40">|</span>
      <select className="w-24 rounded border bg-background px-1 py-0.5 text-[11px]" value={toBranch} onChange={(e) => setToBranch(e.target.value)}>
        <option value="">Transfer…</option>
        {branches.filter((b) => b.id !== branchId).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
      </select>
      <input className="w-10 rounded border bg-background px-1 py-0.5 text-[11px]" value={qty} onChange={(e) => setQty(e.target.value)} />
      <button className="text-[11px] text-primary hover:underline" disabled={busy || !toBranch} onClick={() => run(() => transferStock({ fromBranchId: branchId, toBranchId: toBranch, productId, qty: parseInt(qty) || 1 }), "transfer ok")}>
        Go
      </button>
      {msg && <span className="text-[10px] text-muted-foreground">{msg}</span>}
    </div>
  );
}
