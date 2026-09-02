"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/actions/tasks";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function NewTaskForm({ users, leads }: { users: { id: string; name: string }[]; leads: { id: string; customerName: string }[] }) {
  const router = useRouter();
  const lang = useLang();
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
        <label className={labelCls}>{t("ws.task.title-label", lang)}</label>
        <input className={inputCls} required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder={t("ws.task.title-placeholder", lang)} />
      </div>
      <div>
        <label className={labelCls}>{t("ws.task.owner", lang)}</label>
        <select className={inputCls} value={f.ownerId} onChange={(e) => set("ownerId", e.target.value)}>
          <option value="">{t("ws.task.unassigned", lang)}</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>{t("ws.task.related-to", lang)}</label>
          <select className={inputCls} value={f.relatedType} onChange={(e) => set("relatedType", e.target.value)}>
            <option value="">{t("ws.task.none", lang)}</option>
            <option value="LEAD">{t("ws.task.lead", lang)}</option>
            <option value="CUSTOMER">{t("ws.task.customer", lang)}</option>
            <option value="BOOKING">{t("ws.task.booking", lang)}</option>
            <option value="VEHICLE">{t("ws.task.vehicle", lang)}</option>
            <option value="JOB">{t("ws.task.job", lang)}</option>
          </select>
        </div>
        {f.relatedType === "LEAD" ? (
          <div>
            <label className={labelCls}>{t("ws.task.lead", lang)}</label>
            <select className={inputCls} value={f.relatedId} onChange={(e) => set("relatedId", e.target.value)}>
              <option value="">{t("ws.task.select", lang)}</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.customerName}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className={labelCls}>{t("ws.task.priority", lang)}</label>
            <select className={inputCls} value={f.priority} onChange={(e) => set("priority", e.target.value)}>
              <option value="LOW">{t("ws.priority.LOW", lang)}</option><option value="NORMAL">{t("ws.priority.NORMAL", lang)}</option><option value="HIGH">{t("ws.priority.HIGH", lang)}</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>{t("ws.task.due", lang)}</label>
        <input className={inputCls} type="datetime-local" value={f.dueAt} onChange={(e) => set("dueAt", e.target.value)} />
      </div>
      <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-1.5 text-sm font-medium disabled:opacity-50">{t("ws.task.create", lang)}</button>
    </form>
  );
}
