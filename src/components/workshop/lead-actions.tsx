"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLead, addLeadNote, convertLead, closeLeadLost } from "@/actions/leads";

export function LeadActions({ leadId, stages, salespeople, currentStageId, currentOwnerId }: {
  leadId: string;
  stages: { id: string; name: string }[];
  salespeople: { id: string; name: string; role: string }[];
  currentStageId: string | null;
  currentOwnerId: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true); setMsg("");
    const res = await fn();
    setBusy(false);
    if (!res.ok) setMsg(res.error ?? "Failed");
    else { setMsg("Saved ✓"); router.refresh(); }
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="space-y-4">
      {msg && <p className="rounded-md bg-primary/10 text-primary text-xs px-3 py-2">{msg}</p>}
      <div>
        <label className={labelCls}>Pipeline stage</label>
        <select
          className={inputCls}
          defaultValue={currentStageId ?? ""}
          disabled={busy}
          onChange={(e) => run(() => updateLead(leadId, { stageId: e.target.value || undefined }))}
        >
          <option value="">No stage</option>
          {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Assigned salesperson</label>
        <select
          className={inputCls}
          defaultValue={currentOwnerId ?? ""}
          disabled={busy}
          onChange={(e) => run(() => updateLead(leadId, { assignedUserId: e.target.value || undefined }))}
        >
          <option value="">Unassigned</option>
          {salespeople.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Add note / activity</label>
        <textarea className={inputCls} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Record a call, WhatsApp reply…" />
        <button
          className="mt-2 w-full rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          disabled={busy || !note.trim()}
          onClick={async () => {
            setBusy(true);
            await addLeadNote(leadId, note);
            setNote(""); setBusy(false); setMsg("Note added ✓"); router.refresh();
          }}
        >
          Add note
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 border-t">
        <button
          className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm font-medium disabled:opacity-50"
          disabled={busy}
          onClick={async () => {
            setBusy(true); setMsg("");
            const res = await convertLead(leadId);
            setBusy(false);
            if (!res.ok) { setMsg(res.error ?? "Failed"); return; }
            router.push("/workshop/customers/" + res.customerId);
            router.refresh();
          }}
        >
          Close Won → Customer
        </button>
        <div>
          <input className={inputCls} placeholder="Lost reason…" value={lostReason} onChange={(e) => setLostReason(e.target.value)} />
          <button
            className="mt-2 w-full rounded-md border border-destructive/40 text-destructive px-3 py-2 text-sm font-medium disabled:opacity-50"
            disabled={busy || !lostReason.trim()}
            onClick={() => run(() => closeLeadLost(leadId, lostReason))}
          >
            Close Lost
          </button>
        </div>
      </div>
    </div>
  );
}
