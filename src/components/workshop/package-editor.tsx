"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Gift, X } from "lucide-react";
import { updatePackage, type PackageItemInput } from "@/actions/packages";

type PkgItem = { id: string; name: string; kind: string; defaultQty: number; priceSen: number; productId: string | null };
type Pkg = { id: string; name: string; tier: string; priceSen: number; description: string | null; isBestValue: boolean; active: boolean; items: PkgItem[] };
type Candidate = { name: string; kind: "SERVICE" | "PART"; source: string };

export function PackageEditor({ pkg, candidates, dupMap }: {
  pkg: Pkg;
  candidates: Candidate[];
  dupMap: Record<string, string[]>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(pkg.name);
  const [price, setPrice] = useState(String(pkg.priceSen / 100));
  const [description, setDescription] = useState(pkg.description ?? "");
  const [isBestValue, setIsBestValue] = useState(pkg.isBestValue);
  const [active, setActive] = useState(pkg.active);
  // selected items as {name, kind} — initialized from current items
  const [items, setItems] = useState<{ name: string; kind: string }[]>(pkg.items.map((i) => ({ name: i.name, kind: i.kind })));
  const [giftName, setGiftName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const isSelected = (n: string) => items.some((i) => i.name === n);
  const toggle = (c: Candidate) => {
    setItems((prev) => isSelected(c.name) ? prev.filter((i) => i.name !== c.name) : [...prev, { name: c.name, kind: c.kind }]);
  };

  async function save() {
    setBusy(true); setMsg("");
    const payload: PackageItemInput[] = items.map((i) => ({
      name: i.name, kind: (i.kind === "GIFT" ? "GIFT" : i.kind === "PART" ? "PART" : "SERVICE") as "SERVICE" | "PART" | "GIFT",
      defaultQty: 1, priceSen: 0,
    }));
    const res = await updatePackage(pkg.id, {
      name, priceSen: Math.round(parseFloat(price) * 100) || 0, description: description || null,
      isBestValue, active, items: payload,
    });
    setBusy(false);
    if (!res.ok) { setMsg(res.error ?? "Failed"); return; }
    setOpen(false); setMsg("Saved ✓");
    router.refresh();
  }

  const inputCls = "rounded-md border bg-background px-3 py-1.5 text-sm";
  const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

  return (
    <div>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent">
        <Pencil className="h-3.5 w-3.5" /> Edit package
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border bg-background p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Edit {pkg.name}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Name</label>
                <input className={inputCls + " w-full"} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Price (RM)</label>
                <input className={inputCls + " w-full"} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description</label>
                <input className={inputCls + " w-full"} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isBestValue} onChange={(e) => setIsBestValue(e.target.checked)} /> Best value
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
              </label>
            </div>

            <div className="mt-4">
              <label className={labelCls}>Included items — tick to include (⚠ = also in another package)</label>
              <div className="rounded-lg border max-h-48 overflow-y-auto divide-y">
                {candidates.map((c) => {
                  const sel = isSelected(c.name);
                  const dups = sel ? (dupMap[c.name] ?? []) : [];
                  return (
                    <label key={c.source + c.name} className={"flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent/40 " + (sel ? "bg-primary/5" : "")}>
                      <input type="checkbox" checked={sel} onChange={() => toggle(c)} />
                      <span className="flex-1">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{c.kind}</span>
                      {dups.length > 0 && <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5">⚠ in {dups.join(", ")}</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <label className={labelCls}>Free gift (optional) 🎁</label>
              <div className="flex gap-2">
                <input className={inputCls + " flex-1"} value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="e.g. Free keychain / chain lube sachet" />
                <button
                  className="rounded-md border px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1 hover:bg-accent"
                  disabled={!giftName.trim()}
                  onClick={() => { setItems((p) => [...p, { name: giftName.trim(), kind: "GIFT" }]); setGiftName(""); }}
                >
                  <Gift className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <div className="text-[11px] font-medium text-muted-foreground mb-1.5">Currently included ({items.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((i) => (
                  <span key={i.name} className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs">
                    {i.kind === "GIFT" ? "🎁" : i.kind === "PART" ? "🔩" : "✓"} {i.name}
                    <button onClick={() => setItems((p) => p.filter((x) => x.name !== i.name))} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            {msg && <p className="mt-2 text-xs text-primary">{msg}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-md border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Cancel</button>
              <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50" disabled={busy} onClick={save}>
                {busy ? "Saving…" : "Save package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
