"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTemplate } from "@/actions/messaging";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function TemplateManager() {
  const router = useRouter();
  const lang = useLang();
  const [f, setF] = useState({ name: "", channel: "WHATSAPP", body: "" });
  const [busy, setBusy] = useState(false);
  const inputCls = "w-full rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await createTemplate(f);
    setBusy(false);
    setF({ name: "", channel: "WHATSAPP", body: "" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-4 grid sm:grid-cols-[1fr_140px_1fr_auto] gap-3 items-end">
      <div>
        <label className={labelCls}>{t("ws.products.col.name", lang)}</label>
        <input className={inputCls} required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={t("template.placeholder-name", lang)} />
      </div>
      <div>
        <label className={labelCls}>{t("msg.col-channel", lang)}</label>
        <select className={inputCls} value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}>
          <option>WHATSAPP</option><option>SMS</option><option>EMAIL</option><option>APP</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>{t("template.body-label", lang)}</label>
        <input className={inputCls} required value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder={t("template.placeholder-body", lang)} />
      </div>
      <button type="submit" disabled={busy} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50">{t("common.add", lang)}</button>
    </form>
  );
}
