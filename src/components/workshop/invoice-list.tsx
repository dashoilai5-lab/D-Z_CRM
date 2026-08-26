"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckSquare, Square, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { settleInvoices, addInvoicePayment } from "@/actions/invoices";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";
import { formatRM } from "@/lib/money";

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  status: string;
  totalSen: number;
  paidSen: number;
  customerName: string;
  issuedAt: string;
}

const METHODS = ["CASH", "CARD", "ONLINE", "EWALLET"];

/** Workshop 发票结清：tick 多选批量结清 + 每单 split 收款。 */
export function InvoiceList({ invoices, lang }: { invoices: InvoiceRow[]; lang: import("@/lib/i18n").Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [payFor, setPayFor] = useState<InvoiceRow | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");

  const unpaid = useMemo(() => invoices.filter((i) => i.status !== "PAID"), [invoices]);
  const allUnpaidSelected = unpaid.length > 0 && unpaid.every((i) => selected.has(i.id));

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleAll = () => setSelected(allUnpaidSelected ? new Set() : new Set(unpaid.map((i) => i.id)));

  const settle = () =>
    start(async () => {
      const r = await settleInvoices([...selected]);
      if (r.ok) { toast.success(tpl("inv.settled", lang, { n: r.settled })); setSelected(new Set()); router.refresh(); }
      else toast.error(r.error);
    });

  const pay = () =>
    start(async () => {
      if (!payFor) return;
      const r = await addInvoicePayment(payFor.id, Math.round(parseFloat(amount || "0") * 100), method);
      if (r.ok) { toast.success(t("inv.payment-added", lang)); setPayFor(null); setAmount(""); router.refresh(); }
      else toast.error(r.error);
    });

  return (
    <>
      {/* 批量操作条 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button type="button" onClick={toggleAll} className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
          {allUnpaidSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5" />}
          {t("inv.select-all", lang)}
        </button>
        <Button size="sm" disabled={selected.size === 0 || pending} onClick={settle}>
          <Wallet className="h-3.5 w-3.5 mr-1.5" />{tpl("inv.settle-selected", lang, { n: selected.size })}
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">{unpaid.length} {t("inv.unpaid", lang).toLowerCase()}</span>
      </div>

      {/* 发票列表 */}
      <div className="space-y-2">
        {invoices.length === 0 && <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">{t("inv.empty", lang)}</div>}
        {invoices.map((inv) => {
          const isPaid = inv.status === "PAID";
          const remaining = Math.max(0, inv.totalSen - inv.paidSen);
          return (
            <div key={inv.id} className={"rounded-2xl border bg-card p-4 transition-opacity " + (isPaid ? "opacity-60" : "")}>
              <div className="flex items-center gap-3">
                {!isPaid && (
                  <button type="button" onClick={() => toggle(inv.id)} aria-label="select" className="shrink-0">
                    {selected.has(inv.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground/50" />}
                  </button>
                )}
                {isPaid && <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">✓</span>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold">{inv.invoiceNumber}</span>
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (isPaid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300")}>
                      {isPaid ? t("inv.paid", lang) : t("inv.unpaid", lang)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{inv.customerName} · {inv.issuedAt}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{formatRM(inv.totalSen)}</div>
                  {!isPaid && <div className="text-[10px] text-amber-600 dark:text-amber-400">{t("inv.remaining", lang)} {formatRM(remaining)}</div>}
                </div>
                {!isPaid && (
                  <Button size="sm" variant="outline" onClick={() => { setPayFor(inv); setAmount(String(remaining / 100)); setMethod("CASH"); }}>
                    {t("inv.receive", lang)}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Split payment 弹窗 */}
      <Dialog open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("inv.receive", lang)} · {payFor?.invoiceNumber}</DialogTitle>
            <DialogDescription>{t("inv.total", lang)} {payFor ? formatRM(payFor.totalSen) : ""} · {t("inv.remaining", lang)} {payFor ? formatRM(Math.max(0, payFor.totalSen - payFor.paidSen)) : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>{t("inv.amount", lang)}</Label>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>{t("inv.method", lang)}</Label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <Button className="w-full" disabled={pending || parseFloat(amount || "0") <= 0} onClick={pay}>{t("inv.pay", lang)}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
