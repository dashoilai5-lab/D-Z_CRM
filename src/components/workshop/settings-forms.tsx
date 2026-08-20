"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrganisation, updateBranch, createBranch, createServiceType, toggleServiceType } from "@/actions/settings";

const inputCls = "w-full rounded-md border bg-background px-3 py-1.5 text-sm";
const labelCls = "text-[11px] font-medium text-muted-foreground mb-0.5 block";

export function OrgProfileForm({ org }: { org: { name: string; contactPhone: string | null; contactEmail: string | null; address: string | null; taxId: string | null; timezone: string; currency: string } }) {
  const router = useRouter();
  const [f, setF] = useState(org);
  const [msg, setMsg] = useState("");
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold text-sm mb-3">Organisation profile</h2>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelCls}>Name</label><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className={labelCls}>Phone</label><input className={inputCls} value={f.contactPhone ?? ""} onChange={(e) => setF({ ...f, contactPhone: e.target.value })} /></div>
        <div><label className={labelCls}>Email</label><input className={inputCls} value={f.contactEmail ?? ""} onChange={(e) => setF({ ...f, contactEmail: e.target.value })} /></div>
        <div><label className={labelCls}>Tax ID</label><input className={inputCls} value={f.taxId ?? ""} onChange={(e) => setF({ ...f, taxId: e.target.value })} /></div>
        <div><label className={labelCls}>Timezone</label><input className={inputCls} value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} /></div>
        <div><label className={labelCls}>Currency</label><input className={inputCls} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} /></div>
        <div className="col-span-2"><label className={labelCls}>Address</label><input className={inputCls} value={f.address ?? ""} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      </div>
      <button className="mt-3 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium" onClick={async () => { await updateOrganisation(f); setMsg("Saved ✓"); router.refresh(); }}>Save</button>
      {msg && <span className="ml-2 text-xs text-muted-foreground">{msg}</span>}
    </div>
  );
}

export function LostReasonsEditor({ current }: { current: string }) {
  const router = useRouter();
  const [val, setVal] = useState((JSON.parse(current || "[]") as string[]).join("\n"));
  const [msg, setMsg] = useState("");
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold text-sm mb-1">Closed-lost reasons (PIPE-013)</h2>
      <p className="text-[11px] text-muted-foreground mb-2">One per line — selectable when closing a lead.</p>
      <textarea className={inputCls + " h-32"} value={val} onChange={(e) => setVal(e.target.value)} />
      <button className="mt-2 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium" onClick={async () => {
        const reasons = val.split("\n").map((s) => s.trim()).filter(Boolean);
        await updateOrganisation({ lostReasons: JSON.stringify(reasons) });
        setMsg("Saved " + reasons.length + " reasons ✓"); router.refresh();
      }}>Save</button>
      {msg && <span className="ml-2 text-xs text-muted-foreground">{msg}</span>}
    </div>
  );
}

export function BranchManager({ branches }: { branches: { id: string; name: string; city: string; phone: string | null; address: string | null; isMain: boolean; operatingHours: string | null }[] }) {
  const router = useRouter();
  const [nf, setNf] = useState({ name: "D&Z Smart Workshop", city: "", phone: "", address: "" });
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold text-sm mb-3">Branches</h2>
      <div className="space-y-2">
        {branches.map((b) => (
          <div key={b.id} className="flex items-center gap-2 text-sm">
            <span className="font-medium">{b.name} · {b.city}</span>
            {b.isMain && <span className="rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5">MAIN</span>}
            <span className="text-xs text-muted-foreground">{b.phone}</span>
            <div className="flex-1" />
            <span className="text-[11px] text-muted-foreground">{b.operatingHours ? "hours set" : "no hours"}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 border-t pt-3">
        <input className={inputCls} placeholder="City *" value={nf.city} onChange={(e) => setNf({ ...nf, city: e.target.value })} />
        <input className={inputCls} placeholder="Phone" value={nf.phone} onChange={(e) => setNf({ ...nf, phone: e.target.value })} />
        <input className={inputCls + " col-span-2"} placeholder="Address" value={nf.address} onChange={(e) => setNf({ ...nf, address: e.target.value })} />
        <button className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium col-span-4" disabled={!nf.city} onClick={async () => { await createBranch(nf); setNf({ name: "D&Z Smart Workshop", city: "", phone: "", address: "" }); router.refresh(); }}>
          Add branch
        </button>
      </div>
    </div>
  );
}

export function ServiceTypeManager({ serviceTypes }: { serviceTypes: { id: string; name: string; category: string | null; durationMin: number | null; priceSen: number | null; active: boolean }[] }) {
  const router = useRouter();
  const [nf, setNf] = useState({ name: "", category: "MAINTENANCE", durationMin: "60" });
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold text-sm mb-3">Service catalogue</h2>
      <div className="flex gap-2 mb-3">
        <input className={inputCls + " flex-1"} placeholder="Service name *" value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} />
        <select className={inputCls + " w-40"} value={nf.category} onChange={(e) => setNf({ ...nf, category: e.target.value })}>
          <option>MAINTENANCE</option><option>REPAIR</option><option>DIAGNOSTIC</option><option>DETAILING</option>
        </select>
        <input className={inputCls + " w-24"} type="number" placeholder="min" value={nf.durationMin} onChange={(e) => setNf({ ...nf, durationMin: e.target.value })} />
        <button className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium" disabled={!nf.name} onClick={async () => { await createServiceType({ name: nf.name, category: nf.category, durationMin: parseInt(nf.durationMin) || undefined }); setNf({ name: "", category: "MAINTENANCE", durationMin: "60" }); router.refresh(); }}>Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {serviceTypes.map((s) => (
          <button key={s.id} className={"rounded-full border px-2.5 py-1 text-xs " + (s.active ? "" : "opacity-50")} onClick={async () => { await toggleServiceType(s.id, !s.active); router.refresh(); }}>
            {s.name} <span className="text-muted-foreground">({s.category ?? "—"})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
