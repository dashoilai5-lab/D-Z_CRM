"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createPackage } from "@/actions/packages";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function NewPackageForm({ candidates }: { candidates: { name: string; kind: "SERVICE" | "PART"; source: string }[] }) {
  const router = useRouter();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tier, setTier] = useState("GOOD");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<{ name: string; kind: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const toggle = (c: { name: string; kind: string }) => {
    setItems((prev) => prev.some((i) => i.name === c.name) ? prev.filter((i) => i.name !== c.name) : [...prev, { name: c.name, kind: c.kind }]);
  };

  async function save() {
    setBusy(true); setMsg("");
    const res = await createPackage({
      name, priceSen: Math.round(parseFloat(price) * 100) || 0, tier,
      items: items.map((i) => ({ name: i.name, kind: (i.kind === "PART" ? "PART" : "SERVICE") as "SERVICE" | "PART", defaultQty: 1, priceSen: 0 })),
    });
    setBusy(false);
    setOpen(false); setMsg(t("ws.pkg.created", lang));
    router.refresh();
  }

  const inputCls = "rounded-md border bg-background px-3 py-1.5 text-sm w-full";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  return (
    <div>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        <Plus className="h-4 w-4" /> {t("ws.pkg.new", lang)}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border bg-background p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("ws.pkg.new-title", lang)}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t("ws.pkg.name", lang)}</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("ws.package.name-placeholder", lang)} />
              </div>
              <div>
                <label className={labelCls}>{t("ws.pkg.price", lang)}</label>
                <input className={inputCls} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{t("ws.pkg.tier", lang)}</label>
                <select className={inputCls} value={tier} onChange={(e) => setTier(e.target.value)}>
                  <option value="GOOD">{t("ws.pkg.tier.GOOD", lang)}</option><option value="BETTER">{t("ws.pkg.tier.BETTER", lang)}</option><option value="BEST">{t("ws.pkg.tier.BEST", lang)}</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("ws.pkg.description", lang)}</label>
                <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>{t("ws.pkg.include-items", lang)}</label>
              <div className="rounded-lg border max-h-48 overflow-y-auto divide-y">
                {candidates.map((c) => (
                  <label key={c.source + c.name} className={"flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent/40 " + (items.some((i) => i.name === c.name) ? "bg-primary/5" : "")}>
                    <input type="checkbox" checked={items.some((i) => i.name === c.name)} onChange={() => toggle(c)} />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{c.kind}</span>
                  </label>
                ))}
              </div>
            </div>
            {msg && <p className="mt-2 text-xs text-primary">{msg}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-md border px-4 py-2 text-sm" onClick={() => setOpen(false)}>{t("common.cancel", lang)}</button>
              <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50" disabled={busy || !name || !price} onClick={save}>
                {busy ? t("ws.pkg.creating", lang) : t("ws.pkg.create", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
