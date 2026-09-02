"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSlots, updateSlot, deleteSlot } from "@/actions/slots";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export function SlotManager({ branches }: { branches: { id: string; label: string }[] }) {
  const router = useRouter();
  const lang = useLang();
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [days, setDays] = useState("7");
  const [times, setTimes] = useState("09:00,10:00,11:00,14:00,15:00,16:00");
  const [max, setMax] = useState("2");
  const [msg, setMsg] = useState("");

  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold text-sm mb-3">{t("slot.generate", lang)}</h2>
      <div className="grid sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">{t("form.branch", lang)}</label>
          <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">{t("slot.days-ahead", lang)}</label>
          <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" type="number" min="1" max="30" value={days} onChange={(e) => setDays(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">{t("slot.times", lang)}</label>
          <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={times} onChange={(e) => setTimes(e.target.value)} />
        </div>
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">{t("slot.max-per-slot", lang)}</label>
          <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" type="number" min="1" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
      </div>
      <button
        className="mt-3 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
        disabled={!branchId || !days || !times}
        onClick={async () => {
          const res = await generateSlots({ branchId, days: parseInt(days), times: times.split(",").map((t) => t.trim()).filter(Boolean), maxBookings: parseInt(max) });
          setMsg(tpl("slot.generated", lang, { n: res.created ?? 0 }));
          router.refresh();
        }}
      >
        {t("slot.generate", lang)}
      </button>
      {msg && <span className="ml-3 text-xs text-muted-foreground">{msg}</span>}
    </div>
  );
}

export function SlotRowActions({ slotId, maxBookings, isHoliday }: { slotId: string; maxBookings: number; isHoliday: boolean }) {
  const router = useRouter();
  const lang = useLang();
  const [m, setM] = useState(String(maxBookings));
  return (
    <div className="inline-flex items-center gap-1.5">
      <input className="w-14 rounded border bg-background px-1.5 py-0.5 text-xs" value={m} onChange={(e) => setM(e.target.value)} />
      <button className="text-[11px] text-primary hover:underline" onClick={async () => { await updateSlot(slotId, { maxBookings: parseInt(m) || 1 }); router.refresh(); }}>{t("common.save", lang)}</button>
      <button className="text-[11px] text-primary hover:underline" onClick={async () => { await updateSlot(slotId, { isHoliday: !isHoliday }); router.refresh(); }}>{t(isHoliday ? "slot.reopen" : "slot.holiday", lang)}</button>
      <button className="text-[11px] text-destructive hover:underline" onClick={async () => { await deleteSlot(slotId); router.refresh(); }}>{t("common.delete", lang)}</button>
    </div>
  );
}
