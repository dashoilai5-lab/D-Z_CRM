"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { transferMotorcycle } from "@/actions/motorcycles";

export function TransferMotorcycle({ bikeId, currentOwnerId, customers }: { bikeId: string; currentOwnerId: string; customers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function doTransfer() {
    setBusy(true); setMsg("");
    const res = await transferMotorcycle(bikeId, targetId);
    setBusy(false);
    if (!res.ok) { setMsg(res.error ?? "Failed"); return; }
    setMsg("Transferred ✓ — history preserved"); setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <button className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent" onClick={() => setOpen(!open)}>
        Transfer ownership
      </button>
      {open && (
        <div className="mt-3 flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">New owner</label>
            <select className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">Select customer…</option>
              {customers.filter((c) => c.id !== currentOwnerId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-50" disabled={busy || !targetId} onClick={doTransfer}>
            {busy ? "…" : "Transfer"}
          </button>
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        </div>
      )}
    </div>
  );
}
