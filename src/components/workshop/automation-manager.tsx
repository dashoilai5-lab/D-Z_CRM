"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAutomationRule, toggleAutomation } from "@/actions/messaging";

const TRIGGERS = ["LEAD_CREATED", "LEAD_STAGE_CHANGED", "BOOKING_CREATED", "BOOKING_APPROACHING", "SERVICE_COMPLETED", "SERVICE_DUE", "JOB_READY", "CUSTOMER_INACTIVE", "LOYALTY_EVENT", "LOW_STOCK"];

export function AutomationManager() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", trigger: "LEAD_CREATED", actionType: "CREATE_TASK", title: "Follow up", dueInDays: "2" });
  const [busy, setBusy] = useState(false);
  const inputCls = "w-full rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const actionsJson = JSON.stringify([{ type: f.actionType, title: f.title || undefined, dueInDays: parseInt(f.dueInDays) || undefined }]);
    await createAutomationRule({ name: f.name, trigger: f.trigger, actionsJson });
    setBusy(false);
    setF({ name: "", trigger: "LEAD_CREATED", actionType: "CREATE_TASK", title: "Follow up", dueInDays: "2" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-4 grid sm:grid-cols-[1fr_180px_180px_1fr_90px_auto] gap-3 items-end">
      <div>
        <label className={labelCls}>Rule name</label>
        <input className={inputCls} required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Auto-follow-up on new lead" />
      </div>
      <div>
        <label className={labelCls}>Trigger</label>
        <select className={inputCls} value={f.trigger} onChange={(e) => setF({ ...f, trigger: e.target.value })}>
          {TRIGGERS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ").toLowerCase()}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Action</label>
        <select className={inputCls} value={f.actionType} onChange={(e) => setF({ ...f, actionType: e.target.value })}>
          <option value="CREATE_TASK">Create task</option><option value="ASSIGN_LEAD">Assign lead</option>
          <option value="SEND_MESSAGE">Send message</option><option value="SCHEDULE_REMINDER">Schedule reminder</option>
          <option value="UPDATE_TAGS">Update tags</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Task title</label>
        <input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Due (days)</label>
        <input className={inputCls} type="number" min="0" value={f.dueInDays} onChange={(e) => setF({ ...f, dueInDays: e.target.value })} />
      </div>
      <button type="submit" disabled={busy} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50">Create</button>
    </form>
  );
}

export function ToggleRule({ ruleId, active }: { ruleId: string; active: boolean }) {
  const router = useRouter();
  return (
    <button
      className={"rounded-md border px-3 py-1 text-xs font-medium " + (active ? "text-destructive" : "text-primary")}
      onClick={async () => { await toggleAutomation(ruleId, !active); router.refresh(); }}
    >
      {active ? "Pause" : "Enable"}
    </button>
  );
}
