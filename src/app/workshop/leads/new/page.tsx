"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLead } from "@/actions/leads";

export default function NewLeadPage() {
  const router = useRouter();
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
    if (!res.ok) { setError("Failed to create lead"); return; }
    if (res.duplicates > 0) { setDupes(res.duplicates); return; }
    router.push("/workshop/leads/" + res.id);
    router.refresh();
  }

  const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">New Lead</h1>
        <p className="text-sm text-muted-foreground">Walk-in, phone or social — record the enquiry, it flows into the pipeline.</p>
      </div>

      {dupes != null && (
        <div className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm px-3 py-2">
          ⚠️ {dupes} similar lead{dupes > 1 ? "s" : ""} found with the same phone/email. Lead saved anyway — review duplicates before converting.
          <button className="ml-2 underline" onClick={() => { setDupes(null); router.push("/workshop/leads"); }}>View leads</button>
        </div>
      )}
      {error && <p className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</p>}

      <form onSubmit={submit} className="rounded-xl border bg-card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Customer name *</label>
            <input className={inputCls} required value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="e.g. Nurul Aisyah" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="012-345 6789" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@email.com" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Source</label>
            <select className={inputCls} value={form.sourceId} onChange={(e) => set("sourceId", e.target.value)}>
              <option value="">Select source…</option>
              <option value="walkin">Walk-in</option>
              <option value="phone">Phone</option>
              <option value="social">Social Media</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Motorcycle interest</label>
            <input className={inputCls} value={form.motorcycleInterest} onChange={(e) => set("motorcycleInterest", e.target.value)} placeholder="e.g. Yamaha Y16ZR" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="What is the prospect looking for?" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Est. deal value (RM)</label>
            <input className={inputCls} type="number" min="0" step="0.01" value={form.estimatedValueRM} onChange={(e) => set("estimatedValueRM", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Next follow-up</label>
            <input className={inputCls} type="datetime-local" value={form.nextFollowUpAt} onChange={(e) => set("nextFollowUpAt", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Tags</label>
            <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="comma, separated" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-md border px-4 py-2 text-sm" onClick={() => router.back()}>Cancel</button>
          <button type="submit" disabled={busy} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50">{busy ? "Saving…" : "Create lead"}</button>
        </div>
      </form>
    </div>
  );
}
