"use client";

import { useRouter } from "next/navigation";
import { updateTestRideStatus } from "@/actions/test-rides";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export type RideItem = {
  id: string; motorcycleModel: string; rideDate: Date; timeSlot: string | null; status: string; notes: string | null;
  branch: { id: string; name: string; city: string } | null;
  lead: { id: string; customerName: string; phone: string | null } | null;
  customer: { id: string; name: string; phone: string | null } | null;
  salesperson: { id: string; name: string } | null;
};

const STYLE: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  CONFIRMED: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  COMPLETED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  CANCELLED: "bg-muted text-muted-foreground",
  NO_SHOW: "bg-destructive/10 text-destructive",
};

export function TestRideList({ items }: { items: RideItem[] }) {
  const router = useRouter();
  const lang = useLang();
  const act = async (id: string, s: string) => { await updateTestRideStatus(id, s); router.refresh(); };
  const who = (r: RideItem) => r.customer?.name ?? r.lead?.customerName ?? "—";

  return (
    <div className="rounded-xl border bg-card divide-y">
      {items.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t("ws.testride.empty", lang)}</div>}
      {items.map((r) => (
        <div key={r.id} className="px-4 py-3 flex items-center gap-3 flex-wrap" data-testid="ride-row">
          <div className="min-w-[180px]">
            <div className="font-medium text-sm">{r.motorcycleModel}</div>
            <div className="text-xs text-muted-foreground">{who(r)} {r.lead?.phone ?? r.customer?.phone ?? ""}</div>
          </div>
          <div className="text-xs text-muted-foreground">{fmtDate(r.rideDate)}{r.timeSlot ? " " + r.timeSlot : ""}</div>
          <div className="text-xs text-muted-foreground">{r.branch?.city ?? "—"} · {r.salesperson?.name ?? t("ws.testride.no-salesperson", lang)}</div>
          <span className={"rounded-full text-[11px] px-2.5 py-0.5 font-medium " + (STYLE[r.status] ?? "")}>{t("testride.status." + r.status, lang)}</span>
          <div className="flex-1" />
          <div className="flex gap-1.5">
            {r.status === "PENDING" && <button className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent" onClick={() => act(r.id, "CONFIRMED")}>{t("ws.testride.confirm", lang)}</button>}
            {(r.status === "PENDING" || r.status === "CONFIRMED") && (
              <>
                <button className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent" onClick={() => act(r.id, "COMPLETED")}>{t("ws.testride.complete", lang)}</button>
                <button className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent" onClick={() => act(r.id, "NO_SHOW")}>{t("ws.testride.no-show", lang)}</button>
                <button className="rounded-md border border-destructive/30 text-destructive px-2.5 py-1 text-xs font-medium" onClick={() => act(r.id, "CANCELLED")}>{t("common.cancel", lang)}</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
