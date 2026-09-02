"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createLead } from "@/actions/leads";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export default function NewLeadPage() {
  const router = useRouter();
  const lang = useLang();
  const [form, setForm] = useState({ customerName: "", phone: "", email: "", sourceId: "", stageId: "", motorcycleInterest: "", modelInterest: "", notes: "", estimatedValueRM: "", assignedUserId: "", nextFollowUpAt: "", tags: "" });
  const [dupes, setDupes] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await createLead({
      customerName: form.customerName,
      phone: form.phone || undefined,
      email: form.email || undefined,
      sourceId: form.sourceId || undefined,
      stageId: form.stageId || undefined,
      motorcycleInterest: form.motorcycleInterest || undefined,
      modelInterest: form.modelInterest || undefined,
      notes: form.notes || undefined,
      estimatedValueSen: form.estimatedValueRM ? Math.round(parseFloat(form.estimatedValueRM) * 100) : undefined,
      assignedUserId: form.assignedUserId || undefined,
      nextFollowUpAt: form.nextFollowUpAt || undefined,
      tags: form.tags || undefined,
    });
    setBusy(false);
    if (!res.ok) { setError(t("lead.failed", lang)); return; }
    if (res.duplicates > 0) { setDupes(res.duplicates); return; }
    router.push("/workshop/leads/" + res.id);
    router.refresh();
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("lead.new", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("lead.new-subtitle", lang)}</p>
      </div>

      {dupes != null && (
        <div className="flex items-start gap-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm px-3 py-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{tpl("lead.dupe-warn", lang, { n: dupes })}</span>
          <button className="ml-auto shrink-0 underline" onClick={() => { setDupes(null); router.push("/workshop/leads"); }}>{t("lead.view-leads", lang)}</button>
        </div>
      )}
      {error && <p className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</p>}

      <form onSubmit={submit} className="rounded-xl border bg-card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t("lead.customer-name", lang)}</label>
            <input className={inputCls} required value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder={t("lead.ph-name", lang)} />
          </div>
          <div>
            <label className={labelCls}>{t("lead.phone", lang)}</label>
            <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("lead.ph-phone", lang)} />
          </div>
          <div>
            <label className={labelCls}>{t("lead.email", lang)}</label>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={t("lead.ph-email", lang)} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("lead.source", lang)}</label>
            <select className={inputCls} value={form.sourceId} onChange={(e) => set("sourceId", e.target.value)}>
              <option value="">{t("lead.select-source", lang)}</option>
              <option value="walkin">{t("lead.source.walkin", lang)}</option>
              <option value="phone">{t("lead.source.phone", lang)}</option>
              <option value="social">{t("lead.source.social", lang)}</option>
              <option value="whatsapp">{t("lead.source.whatsapp", lang)}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("lead.motorcycle-interest", lang)}</label>
            <input className={inputCls} value={form.motorcycleInterest} onChange={(e) => set("motorcycleInterest", e.target.value)} placeholder={t("lead.ph-bike", lang)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("lead.notes", lang)}</label>
          <textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder={t("lead.ph-notes", lang)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{t("lead.est-value", lang)}</label>
            <input className={inputCls} type="number" min="0" step="0.01" value={form.estimatedValueRM} onChange={(e) => set("estimatedValueRM", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("lead.next-followup", lang)}</label>
            <input className={inputCls} type="datetime-local" value={form.nextFollowUpAt} onChange={(e) => set("nextFollowUpAt", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("lead.tags", lang)}</label>
            <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder={t("lead.ph-tags", lang)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-md border px-4 py-2 text-sm" onClick={() => router.back()}>{t("common.cancel", lang)}</button>
          <button type="submit" disabled={busy} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50">{busy ? t("lead.saving", lang) : t("lead.create", lang)}</button>
        </div>
      </form>
    </div>
  );
}
