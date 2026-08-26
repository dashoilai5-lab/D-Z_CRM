"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckSquare, Square, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { settlePayouts, addPayoutPayment } from "@/actions/payouts";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import type { Lang } from "@/lib/i18n";

export interface PayoutRow {
  id: string;
  name: string;
  jobs: number;
  baseSen: number;
  commissionSen: number;
  addonBonusSen: number;
  totalSen: number;
}

const METHODS = ["CASH", "BANK_TRANSFER", "EWALLET", "CARD"];

/** Foreman 薪资单：tick 批量发薪 + split 分期支付。 */
export function PayoutList({ period, periodStart, foremen, lang }: { period: string; periodStart: string; foremen: PayoutRow[]; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [payFor, setPayFor] = useState<PayoutRow | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");

  const allSelected = foremen.length > 0 && foremen.every((f) => selected.has(f.id));
  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(foremen.map((f) => f.id)));

  const draft = (f: PayoutRow) => ({
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
        <span className="text-xs text-muted-foreground ml-auto">{foremen.length} foremen</span>
      </div>

      {/* 每 foreman 薪资单 */}
      <div className="space-y-2">
        {foremen.length === 0 && <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">{t("settle.empty", lang)}</div>}
        {foremen.map((f) => (
          <div key={f.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => toggle(f.id)} aria-label="select" className="shrink-0">
                {selected.has(f.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground/50" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.jobs} jobs · {t("payout.base", lang)} {formatRM(f.baseSen)} · {t("payout.commission", lang)} {formatRM(f.commissionSen)} · {t("payout.addon", lang)} {formatRM(f.addonBonusSen)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold tabular-nums text-primary">{formatRM(f.totalSen)}</div>
                <div className="text-[10px] text-muted-foreground">{t("payout.total", lang)}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setPayFor(f); setAmount(String(f.totalSen / 100)); setMethod("CASH"); }}>
                {t("payout.pay", lang)}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* split 分期发薪弹窗 */}
      <Dialog open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("payout.pay", lang)} · {payFor?.name}</DialogTitle>
            <DialogDescription>{t("payout.total", lang)} {payFor ? formatRM(payFor.totalSen) : ""}</DialogDescription>
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
