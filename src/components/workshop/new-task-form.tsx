"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/actions/tasks";

export function NewTaskForm({ users, leads }: { users: { id: string; name: string }[]; leads: { id: string; customerName: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ title: "", description: "", ownerId: "", relatedType: "", relatedId: "", dueAt: "", priority: "NORMAL" });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  const inputCls = "w-full rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await createTask({
      title: f.title, description: f.description || undefined, ownerId: f.ownerId || undefined,
      relatedType: f.relatedType || undefined, relatedId: f.relatedId || undefined,
      dueAt: f.dueAt || undefined, priority: f.priority,
    });
    setBusy(false);
    setF({ title: "", description: "", ownerId: "", relatedType: "", relatedId: "", dueAt: "", priority: "NORMAL" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <label className={labelCls}>Title *</label>
        <input className={inputCls} required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Call back about Y16ZR" />
      </div>
      <div>
        <label className={labelCls}>Owner</label>
        <select className={inputCls} value={f.ownerId} onChange={(e) => set("ownerId", e.target.value)}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Related to</label>
          <select className={inputCls} value={f.relatedType} onChange={(e) => set("relatedType", e.target.value)}>
            <option value="">None</option>
            <option value="LEAD">Lead</option>
            <option value="CUSTOMER">Customer</option>
            <option value="BOOKING">Booking</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="JOB">Job</option>
          </select>
        </div>
        {f.relatedType === "LEAD" ? (
          <div>
            <label className={labelCls}>Lead</label>
            <select className={inputCls} value={f.relatedId} onChange={(e) => set("relatedId", e.target.value)}>
              <option value="">Select…</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.customerName}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className={labelCls}>Priority</label>
            <select className={inputCls} value={f.priority} onChange={(e) => set("priority", e.target.value)}>
              <option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>Due</label>
        <input className={inputCls} type="datetime-local" value={f.dueAt} onChange={(e) => set("dueAt", e.target.value)} />
      </div>
      <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-1.5 text-sm font-medium disabled:opacity-50">Create task</button>
    </form>
  );
}
