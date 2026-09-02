"use client";

import { useState } from "react";
import { Bike } from "lucide-react";
import { submitTestRideRequest } from "@/actions/website";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export function TestRideForm({ defaultModel, branches, slots }: { defaultModel?: string; branches: { id: string; label: string }[]; slots: string[] }) {
  const lang = useLang();
  const [form, setForm] = useState({ name: "", phone: "", email: "", model: defaultModel ?? "", branchId: "", rideDate: "", timeSlot: "", notes: "" });
  const [done, setDone] = useState<{ ok: boolean; leadNumber?: string; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await submitTestRideRequest({
      name: form.name, phone: form.phone, email: form.email || undefined, model: form.model,
      branchId: form.branchId || undefined, rideDate: form.rideDate || undefined, timeSlot: form.timeSlot || undefined,
      notes: form.notes || undefined,
    });
    setBusy(false);
    setDone(res);
  }

  if (done?.ok) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Bike className="h-6 w-6" /></div>
        <h2 className="text-lg font-semibold mt-3">{t("form.testride_received", lang)}</h2>
        <p className="text-sm text-muted-foreground mt-1">{tpl("form.testride_ref", lang, { ref: done.leadNumber ?? "" })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-5 space-y-3">
      <h2 className="font-semibold">{t("form.testride_title", lang)}</h2>
      {done && !done.ok && <p className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{done.error}</p>}
      <div>
        <label className={labelCls}>{t("common.name", lang)} *</label>
        <input className={inputCls} required value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>{t("common.phone", lang)} *</label>
        <input className={inputCls} required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>{t("form.model", lang)} *</label>
        <input className={inputCls} required value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. Yamaha Y16ZR" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t("common.date", lang)}</label>
          <input className={inputCls} type="date" value={form.rideDate} onChange={(e) => set("rideDate", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("form.time_slot", lang)}</label>
          <select className={inputCls} value={form.timeSlot} onChange={(e) => set("timeSlot", e.target.value)}>
            <option value="">{t("form.pick_slot", lang)}</option>
            {slots.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>{t("form.branch", lang)}</label>
        <select className={inputCls} value={form.branchId} onChange={(e) => set("branchId", e.target.value)}>
          <option value="">{t("form.main_branch", lang)}</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
      <button type="submit" disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
        {busy ? t("form.submitting", lang) : t("form.testride_request", lang)}
      </button>
    </form>
  );
}
