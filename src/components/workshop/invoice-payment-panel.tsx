"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addInvoicePayment } from "@/actions/invoices";
import { formatRM } from "@/lib/money";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export interface InvoicePaymentDto {
  id: string;
  invoiceNumber: string;
  status: string;
  totalSen: number;
  paidSen: number;
}

const COLLECT_METHODS = ["CASH", "CARD", "ONLINE", "EWALLET"] as const;

/** Workshop invoice: show status/total/paid/remaining + record a payment (cash/card/online/ewallet). */
export function InvoicePaymentPanel({ invoice }: { invoice: InvoicePaymentDto }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("none");

  const remaining = Math.max(0, invoice.totalSen - invoice.paidSen);
  const isPaid = invoice.status === "PAID" || remaining <= 0;

  const record = () =>
    start(async () => {
      const sen = Math.round(Number(amount) * 100);
      if (!Number.isFinite(sen) || sen <= 0) { toast.error(t("inv.valid-amount", lang)); return; }
      if (sen > remaining) { toast.error(tpl("inv.amount-exceeds", lang, { n: invoice.invoiceNumber })); return; }
      const r = await addInvoicePayment(invoice.id, sen, method === "none" ? "CASH" : method);
      if (!r.ok) { toast.error(r.error ?? t("toast.failed", lang)); return; }
      setOpen(false); setAmount("");
      router.refresh();
      toast.success(tpl("inv.payment-recorded", lang, { n: formatRM(sen) }));
    });

  return (
    <div className="dz-panel p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("inv.title", lang)}</h3>
        <span className={"text-[11px] font-bold uppercase " + (isPaid ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300")}>
          {isPaid ? t("inv.paid", lang) : t("inv.issued", lang)}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{tpl("inv.number", lang, { n: invoice.invoiceNumber })}</p>

      <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">{t("inv.total", lang)}</span><span className="font-bold tabular-nums">{formatRM(invoice.totalSen)}</span></div>
        <div className="mt-1 flex justify-between"><span className="text-muted-foreground">{t("inv.paid", lang)}</span><span className="tabular-nums">{formatRM(invoice.paidSen)}</span></div>
        <div className="mt-1 flex justify-between border-t border-border/60 pt-1 font-semibold"><span>{t("inv.remaining", lang)}</span><span className="tabular-nums">{formatRM(remaining)}</span></div>
      </div>

      {isPaid ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> {t("inv.paid-in-full", lang)}
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {t("inv.record-payment", lang)}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("inv.record-payment-title", lang)}</DialogTitle>
              <DialogDescription>{tpl("inv.record-payment-desc", lang, { inv: invoice.invoiceNumber, total: formatRM(invoice.totalSen), remaining: formatRM(remaining) })}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>{t("inv.amount", lang)} (RM)</Label>
                <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(remaining / 100)} className="mt-1.5" />
              </div>
              <div>
                <Label>{t("inv.method", lang)}</Label>
                <Select value={method} onValueChange={(v) => setMethod(v ?? "none")}>
                  <SelectTrigger className="mt-1.5"><SelectValue>{() => (method === "none" ? t("inv.method-cash", lang) : t("inv.method-" + method, lang))}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {COLLECT_METHODS.map((m) => (<SelectItem key={m} value={m}>{t("inv.method-" + m, lang)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel", lang)}</Button>
              <Button disabled={pending || !amount} onClick={record}>{pending ? t("common.saving", lang) : t("inv.record-payment", lang)}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
