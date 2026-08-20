"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { earnPointsAction, adjustPointsAction, redeemRewardAction } from "@/actions/loyalty";

export function LoyaltyManager({ rewards }: { rewards: { id: string; name: string; pointsRequired: number; active: boolean }[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [points, setPoints] = useState("100");
  const [reason, setReason] = useState("Adjustment");
  const [rewardId, setRewardId] = useState("");
  const [msg, setMsg] = useState("");
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);

  async function loadCustomers(q: string) {
    if (q.length < 2) return;
    const res = await fetch("/api/search?q=" + encodeURIComponent(q) + "&type=customer");
    const data = await res.json();
    setCustomers(Array.isArray(data) ? data : data.customers ?? []);
  }

  const inputCls = "rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  async function run(fn: () => Promise<unknown>, ok: string) {
    setMsg("");
    try { await fn(); setMsg(ok + " ✓"); router.refresh(); }
    catch (e) { setMsg((e as Error).message); }
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h2 className="font-semibold text-sm">Points actions</h2>
      {msg && <p className="text-xs text-primary">{msg}</p>}
      <div>
        <label className={labelCls}>Customer (type 2+ chars to search)</label>
        <input className={inputCls + " w-full"} onChange={(e) => loadCustomers(e.target.value)} placeholder="Search customer…" />
        {customers.length > 0 && (
          <div className="mt-1 rounded-md border max-h-32 overflow-y-auto">
            {customers.map((c) => (
              <button key={c.id} type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent" onClick={() => { setCustomerId(c.id); setCustomers([]); }}>
                {c.name}
              </button>
            ))}
          </div>
        )}
        {customerId && <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-1">Selected ✓</p>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={labelCls}>Points</label>
          <input className={inputCls + " w-full"} type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Reason</label>
          <input className={inputCls + " w-full"} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium disabled:opacity-40" disabled={!customerId} onClick={() => run(() => earnPointsAction({ customerId, points: parseInt(points) || 0, reason: "Manual earn: " + reason }), "Earned")}>Earn</button>
        <button className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40" disabled={!customerId} onClick={() => run(() => adjustPointsAction({ customerId, delta: -(parseInt(points) || 0), reason: "Adjust: " + reason }), "Adjusted")}>− Adjust</button>
        <button className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40" disabled={!customerId} onClick={() => run(() => adjustPointsAction({ customerId, delta: parseInt(points) || 0, reason: "Adjust: " + reason }), "Adjusted")}>+ Adjust</button>
      </div>
      <div className="border-t pt-3">
        <label className={labelCls}>Redeem reward</label>
        <div className="flex gap-2">
          <select className={inputCls + " flex-1"} value={rewardId} onChange={(e) => setRewardId(e.target.value)}>
            <option value="">Select reward…</option>
            {rewards.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.pointsRequired} pts)</option>)}
          </select>
          <button className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-40" disabled={!customerId || !rewardId} onClick={() => run(() => redeemRewardAction({ customerId, rewardId }), "Redeemed")}>Redeem</button>
        </div>
      </div>
    </div>
  );
}
