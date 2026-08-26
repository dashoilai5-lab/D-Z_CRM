"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { confirmPayout } from "@/actions/payouts";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import type { Lang } from "@/lib/i18n";

export interface PendingPayout {
  id: string;
  period: string;
  periodStart: string;
  totalSen: number;
  paidSen: number;
  status: string;
}

const METHODS = ["CASH", "QR"];

/** Mechanic 确认收款：对 PENDING 的薪资单选 CASH / QR 确认（部分或全额）。 */
export function EarningsConfirm({ payouts, lang }: { payouts: PendingPayout[]; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmFor, setConfirmFor] = useState<PendingPayout | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");

  const remaining = confirmFor ? confirmFor.totalSen - confirmFor.paidSen : 0;

  const confirm = () =>
    start(async () => {
      if (!confirmFor) return;
      const r = await confirmPayout(confirmFor.id, Math.round(parseFloat(amount || "0") * 100), method);
      if (r.ok) { toast.success("Payment confirmed"); setConfirmFor(null); setAmount(""); router.refresh(); }
      else toast.error(r.error);
    });

  return (
    <>
      {payouts.map((p) => (
        <div key={p.id} className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{p.period} · {p.periodStart.slice(0, 10)}</div>
              <div className="text-xs text-muted-foreground">Salary {formatRM(p.totalSen)} · Received {formatRM(p.paidSen)}</div>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">PENDING</span>
          </div>
          <Button size="sm" className="mt-3 w-full" onClick={() => { setConfirmFor(p); setAmount(String(Math.max(0, p.totalSen - p.paidSen) / 100)); setMethod("CASH"); }}>
            {t("payout.confirm", lang)} · {formatRM(Math.max(0, p.totalSen - p.paidSen))}
          </Button>
        </div>
      ))}

      <Dialog open={!!confirmFor} onOpenChange={(o) => !o && setConfirmFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payment received</DialogTitle>
            <DialogDescription>Salary {confirmFor ? formatRM(confirmFor.totalSen) : ""} · Remaining {formatRM(remaining)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Amount (RM)</Label>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Method</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)} className={"rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors " + (method === m ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
                    {m === "CASH" ? "💵 Cash" : "📱 QR"}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" disabled={pending || parseFloat(amount || "0") <= 0} onClick={confirm}>Confirm received</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
