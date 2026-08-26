"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, CheckSquare, Clock, Square, Wallet, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { settlePayouts, addPayoutPayment } from "@/actions/payouts";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import { fmtDate } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

export interface ForemanRow {
  id: string;
  name: string;
  jobs: number;
  salesSen: number;
  hours: number;
  addonJobs: number;
  avgTicketSen: number;
  baseSen: number;
  commissionSen: number;
  addonBonusSen: number;
  totalSen: number;
  payoutStatus: string | null; // PAID | PARTIAL | null
  paidSen: number;
  jobsList: { id: string; jobNumber: string; serviceType: string; completedAt: Date; salesSen: number }[];
}

const METHODS = ["CASH", "BANK_TRANSFER", "EWALLET", "CARD"];

/** 结算 + 发薪合并列表：业绩卡 + 薪资单 + tick 批量发薪 + split 分期。 */
export function SettlementPayoutList({ period, periodStart, foremen, lang }: { period: string; periodStart: string; foremen: ForemanRow[]; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [payFor, setPayFor] = useState<ForemanRow | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allSelected = foremen.length > 0 && foremen.every((f) => selected.has(f.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(foremen.map((f) => f.id)));

  const draft = (f: ForemanRow) => ({
    userId: f.id, period, periodStart: new Date(periodStart),
    baseSen: f.baseSen, commissionSen: f.commissionSen, addonBonusSen: f.addonBonusSen, totalSen: f.totalSen,
  });

  const payAll = () =>
    start(async () => {
      const items = foremen.filter((f) => selected.has(f.id)).map(draft);
      const r = await settlePayouts(items);
      if (r.ok) { toast.success(tpl("payout.paid-toast", lang, { n: r.settled })); setSelected(new Set()); router.refresh(); }
      else toast.error(r.error);
    });

  const payOne = () =>
    start(async () => {
      if (!payFor) return;
      const r = await addPayoutPayment({ ...draft(payFor), amountSen: Math.round(parseFloat(amount || "0") * 100), method });
      if (r.ok) { toast.success(t("payout.payment-added", lang)); setPayFor(null); setAmount(""); router.refresh(); }
      else toast.error(r.error);
    });

  return (
    <>
      {/* 批量发薪条 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button type="button" onClick={toggleAll} className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
          {allSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5" />}
          {t("inv.select-all", lang)}
        </button>
        <Button size="sm" disabled={selected.size === 0 || pending} onClick={payAll}>
          <Wallet className="h-3.5 w-3.5 mr-1.5" />{tpl("payout.pay-selected", lang, { n: selected.size })}
        </Button>
      </div>

      {/* 每 foreman 卡：业绩 + 薪资 + 发薪 */}
      <div className="space-y-3">
        {foremen.length === 0 && <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">{t("settle.empty", lang)}</div>}
        {foremen.map((f) => {
          const paid = f.payoutStatus === "PAID";
          const partial = f.payoutStatus === "PARTIAL";
          return (
            <details key={f.id} className="group rounded-2xl border bg-card open:ring-2 open:ring-primary/20">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <button type="button" onClick={(e) => { e.preventDefault(); toggle(f.id); }} aria-label="select" className="shrink-0">
                  {selected.has(f.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground/50" />}
                </button>
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">{f.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.jobs} jobs · {formatRM(f.salesSen)} · {f.hours}h</div>
                </div>
                <div className="text-right">
                  <div className={"text-sm font-bold tabular-nums " + (paid ? "" : "text-primary")}>{formatRM(f.totalSen)}</div>
                  <div className="text-[10px] text-muted-foreground">{t("payout.total", lang)}</div>
                </div>
                <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold " + (paid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : partial ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                  {paid ? t("payout.paid", lang) : partial ? t("payout.partial", lang) : t("payout.unpaid", lang)}
                </span>
                {!paid && (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={(e) => { e.preventDefault(); setPayFor(f); setAmount(String((f.totalSen - f.paidSen) / 100)); setMethod("CASH"); }}>
                    {t("payout.pay", lang)}
                  </Button>
                )}
              </summary>
              <div className="border-t px-4 py-3">
                {/* 业绩明细 */}
                <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>{t("settle.col-sales", lang)}: <strong className="text-foreground">{formatRM(f.salesSen)}</strong></span>
                  <span>{t("settle.col-avg", lang)}: <strong className="text-foreground">{formatRM(f.avgTicketSen)}</strong></span>
                  <span>{t("settle.col-addon", lang)}: <strong className="text-foreground">{f.addonJobs}</strong></span>
                  <span>{t("settle.col-hours", lang)}: <strong className="text-foreground">{f.hours}h</strong></span>
                </div>
                {/* 薪资拆分 */}
                <div className="mb-3 rounded-xl bg-muted/50 p-3 text-xs">
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    <span>{t("payout.base", lang)}: <strong className="tabular-nums">{formatRM(f.baseSen)}</strong></span>
                    <span>{t("payout.commission", lang)}: <strong className="tabular-nums">{formatRM(f.commissionSen)}</strong></span>
                    <span>{t("payout.addon", lang)}: <strong className="tabular-nums">{formatRM(f.addonBonusSen)}</strong></span>
                    <span className="ml-auto">{t("payout.total", lang)}: <strong className="tabular-nums text-primary">{formatRM(f.totalSen)}</strong></span>
                  </div>
                  {partial && <div className="mt-1 text-amber-600 dark:text-amber-400">{t("inv.remaining", lang)} {formatRM(f.totalSen - f.paidSen)}</div>}
                </div>
                {/* 工单明细 */}
                <table className="dz-table w-full text-xs">
                  <thead><tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="px-2 py-2 font-medium">Job</th><th className="px-2 py-2 font-medium">Service</th><th className="px-2 py-2 font-medium">Date</th><th className="px-2 py-2 text-right font-medium">Value</th>
                  </tr></thead>
                  <tbody>
                    {f.jobsList.map((j) => (
                      <tr key={j.id} className="border-b last:border-0">
                        <td className="px-2 py-2 font-mono"><Link href={"/workshop/jobs/" + j.id} className="text-primary hover:underline">{j.jobNumber}</Link></td>
                        <td className="px-2 py-2">{j.serviceType}</td>
                        <td className="px-2 py-2 text-muted-foreground"><CalendarDays className="mr-1 inline h-3 w-3" />{fmtDate(j.completedAt)}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{formatRM(j.salesSen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>

      {/* split 分期发薪弹窗 */}
      <Dialog open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("payout.pay", lang)} · {payFor?.name}</DialogTitle>
            <DialogDescription>{t("payout.total", lang)} {payFor ? formatRM(payFor.totalSen) : ""}{payFor && payFor.paidSen > 0 ? " · " + t("inv.remaining", lang) + " " + formatRM(payFor.totalSen - payFor.paidSen) : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>{t("payout.amount", lang)}</Label>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>{t("payout.method", lang)}</Label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <Button className="w-full" disabled={pending || parseFloat(amount || "0") <= 0} onClick={payOne}>{t("payout.confirm", lang)}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
