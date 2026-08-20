"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scheduleTestRide } from "@/actions/test-rides";

export function NewTestRideForm({ salespeople, leads, branches }: {
  salespeople: { id: string; name: string }[];
  leads: { id: string; customerName: string; motorcycleInterest: string | null }[];
  branches: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [f, setF] = useState({ leadId: "", customerName: "", phone: "", model: "", branchId: "", rideDate: "", timeSlot: "", salespersonId: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  const inputCls = "w-full rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const lead = f.leadId ? leads.find((l) => l.id === f.leadId) : null;
    await scheduleTestRide({
      customerName: lead?.customerName ?? f.customerName,
      phone: lead?.motorcycleInterest ? undefined : f.phone || undefined,
      model: lead?.motorcycleInterest ?? f.model,
      branchId: f.branchId || undefined,
      rideDate: f.rideDate || undefined,
      timeSlot: f.timeSlot || undefined,
      salespersonId: f.salespersonId || undefined,
      leadId: f.leadId || undefined,
    });
    setBusy(false);
    setF({ leadId: "", customerName: "", phone: "", model: "", branchId: "", rideDate: "", timeSlot: "", salespersonId: "" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <label className={labelCls}>From lead</label>
        <select className={inputCls} value={f.leadId} onChange={(e) => { set("leadId", e.target.value); const l = leads.find((x) => x.id === e.target.value); if (l) { set("model", l.motorcycleInterest ?? ""); set("customerName", l.customerName); } }}>
          <option value="">No lead — manual entry</option>
          {leads.map((l) => <option key={l.id} value={l.id}>{l.customerName} ({l.motorcycleInterest ?? "no bike"})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Name *</label>
          <input className={inputCls} required value={f.customerName} onChange={(e) => set("customerName", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Model *</label>
          <input className={inputCls} required value={f.model} onChange={(e) => set("model", e.target.value)} placeholder="Yamaha Y16ZR" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Date</label>
          <input className={inputCls} type="date" value={f.rideDate} onChange={(e) => set("rideDate", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Time</label>
          <input className={inputCls} type="time" value={f.timeSlot} onChange={(e) => set("timeSlot", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Branch</label>
          <select className={inputCls} value={f.branchId} onChange={(e) => set("branchId", e.target.value)}>
            <option value="">Main</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Salesperson</label>
          <select className={inputCls} value={f.salespersonId} onChange={(e) => set("salespersonId", e.target.value)}>
            <option value="">Unassigned</option>
            {salespeople.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-1.5 text-sm font-medium disabled:opacity-50">Schedule test ride</button>
    </form>
  );
}
