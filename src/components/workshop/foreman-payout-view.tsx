"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckSquare, ChevronDown, Square, Wallet } from "lucide-react";
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

export interface DailyBill {
  date: Date;
  jobs: number;
  salesSen: number;
  baseSen: number;
  commissionSen: number;
  addonBonusSen: number;
  totalSen: number;
  payoutStatus: string | null;
  paidSen: number;
  jobsList: { jobId: string; jobNumber: string; serviceType: string; plate: string; customer: string; salesSen: number }[];
}

export interface ForemanBill {
  id: string;
  name: string;
  totalJobs: number;
  totalSalesSen: number;
  totalSen: number;
  daily: DailyBill[];
}

const METHODS = ["CASH", "BANK_TRANSFER", "EWALLET", "CARD"];

/** Foreman 中心发薪：点技师 → 展开每日账单（含当天完成的具体 job）→ tick 发薪。 */
export function ForemanPayoutView({ foremen, lang }: { foremen: ForemanBill[]; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openForeman, setOpenForeman] = useState<string | null>(null);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [payFor, setPayFor] = useState<{ userId: string; name: string; date: Date; baseSen: number; commissionSen: number; addonBonusSen: number; totalSen: number; paidSen: number } | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");

  const key = (uid: string, date: Date) => uid + ":" + date.toISOString();
  const toggle = (k: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });

  const payAll = () =>
    start(async () => {
      const items: { userId: string; period: string; periodStart: Date; baseSen: number; commissionSen: number; addonBonusSen: number; totalSen: number }[] = [];
      for (const f of foremen) for (const b of f.daily) {
        if (selected.has(key(f.id, b.date)) && b.totalSen > 0) {
          items.push({ userId: f.id, period: "day", periodStart: b.date, baseSen: b.baseSen, commissionSen: b.commissionSen, addonBonusSen: b.addonBonusSen, totalSen: b.totalSen });
        }
      }
      const r = await settlePayouts(items);
      if (r.ok) { toast.success(tpl("payout.paid-toast", lang, { n: r.settled })); setSelected(new Set()); router.refresh(); }
      else toast.error(r.error);
    });

  const payOne = () =>
    start(async () => {
      if (!payFor) return;
      const r = await addPayoutPayment({ userId: payFor.userId, period: "day", periodStart: payFor.date, baseSen: payFor.baseSen, commissionSen: payFor.commissionSen, addonBonusSen: payFor.addonBonusSen, totalSen: payFor.totalSen, amountSen: Math.round(parseFloat(amount || "0") * 100), method });
      if (r.ok) { toast.success(t("payout.payment-added", lang)); setPayFor(null); setAmount(""); router.refresh(); }
      else toast.error(r.error);
    });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button size="sm" disabled={selected.size === 0 || pending} onClick={payAll}>
          <Wallet className="h-3.5 w-3.5 mr-1.5" />{tpl("payout.pay-selected", lang, { n: selected.size })}
        </Button>
        <span className="text-xs text-muted-foreground">{foremen.length} foremen</span>
      </div>

      <div className="space-y-2">
        {foremen.length === 0 && <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">{t("settle.empty", lang)}</div>}
        {foremen.map((f) => {
          const isOpen = openForeman === f.id;
          return (
            <div key={f.id} className="rounded-2xl border bg-card overflow-hidden">
              <button type="button" onClick={() => setOpenForeman(isOpen ? null : f.id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/40">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">{f.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.totalJobs} jobs · {formatRM(f.totalSalesSen)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums text-primary">{formatRM(f.totalSen)}</div>
                  <div className="text-[10px] text-muted-foreground">{t("payout.total", lang)}</div>
                </div>
                <ChevronDown className={"h-4 w-4 text-muted-foreground transition-transform " + (isOpen ? "rotate-180" : "")} />
              </button>

              {isOpen && (
                <div className="border-t divide-y divide-border/60">
                  {f.daily.map((b) => {
                    const k = key(f.id, b.date);
                    const paid = b.payoutStatus === "PAID";
                    const partial = b.payoutStatus === "PARTIAL";
                    const dayOpen = openDay === k;
                    return (
                      <div key={k} className={paid ? "opacity-60" : ""}>
                        {/* 账单行 */}
                        <div className="flex items-center gap-3 px-4 py-2.5">
                          <button type="button" onClick={() => toggle(k)} aria-label="select" className="shrink-0">
                            {selected.has(k) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground/50" />}
                          </button>
                          <button type="button" onClick={() => setOpenDay(dayOpen ? null : k)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium">{fmtDate(b.date)} · {b.jobs} job{b.jobs > 1 ? "s" : ""}</div>
                              <div className="text-[11px] text-muted-foreground">{t("payout.base", lang)} {formatRM(b.baseSen)} · {t("payout.commission", lang)} {formatRM(b.commissionSen)}</div>
                            </div>
                            <div className="text-right">
                              <div className={"text-sm font-bold tabular-nums " + (paid ? "" : "text-primary")}>{formatRM(b.totalSen)}</div>
                              {partial && <div className="text-[10px] text-amber-600 dark:text-amber-400">{t("inv.remaining", lang)} {formatRM(b.totalSen - b.paidSen)}</div>}
                            </div>
                            <ChevronDown className={"h-3.5 w-3.5 text-muted-foreground transition-transform " + (dayOpen ? "rotate-180" : "")} />
                          </button>
                          <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold " + (paid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : partial ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                            {paid ? t("payout.paid", lang) : partial ? t("payout.partial", lang) : t("payout.unpaid", lang)}
                          </span>
                          {!paid && (
                            <Button size="sm" variant="outline" className="shrink-0" onClick={() => { setPayFor({ userId: f.id, name: f.name, date: b.date, baseSen: b.baseSen, commissionSen: b.commissionSen, addonBonusSen: b.addonBonusSen, totalSen: b.totalSen, paidSen: b.paidSen }); setAmount(String((b.totalSen - b.paidSen) / 100)); setMethod("CASH"); }}>
                              {t("payout.pay", lang)}
                            </Button>
                          )}
                        </div>
                        {/* 该 foreman 当天完成的具体 job */}
                        {dayOpen && (
                          <div className="mx-4 mb-2.5 rounded-xl bg-muted/40 p-2.5">
                            {b.jobsList.length === 0 && <p className="text-[11px] text-muted-foreground px-1">No jobs.</p>}
                            {b.jobsList.map((j) => (
                              <Link key={j.jobId} href={"/workshop/jobs/" + j.jobId} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] hover:bg-muted/70">
                                <span className="font-mono font-semibold text-primary">{j.jobNumber}</span>
                                <span className="font-medium">{j.plate}</span>
                                <span className="text-muted-foreground">{j.customer}</span>
                                <span className="text-muted-foreground truncate">{j.serviceType}</span>
                                <span className="ml-auto font-bold tabular-nums">{formatRM(j.salesSen)}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("payout.pay", lang)} · {payFor?.name} · {payFor ? fmtDate(payFor.date) : ""}</DialogTitle>
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
