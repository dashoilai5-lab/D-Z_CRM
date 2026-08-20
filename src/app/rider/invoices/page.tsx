import { getDemoCustomer } from "@/lib/demo-customer";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function RiderInvoicesPage() {
  const lang = await getLang();
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const invoices = await db.invoice.findMany({
    where: { customerId: customer.id },
    include: { items: true, payments: true, job: { include: { motorcycle: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("rider.invoices", lang)}</h1>
      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold">{inv.invoiceNumber}</span>
              <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-bold " + (inv.status === "PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300")}>{inv.status}</span>
            </div>
            <div className="mt-2 text-sm font-semibold">{inv.job?.packageName ?? t("rider.service", lang)}</div>
            <div className="text-xs text-muted-foreground">{inv.job?.motorcycle.plate} · {inv.issuedAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div className="mt-3 space-y-1">
              {inv.items.map((i) => (
                <div key={i.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{i.description} ×{i.quantity}</span>
                  <span className="tabular-nums">{formatRM(i.lineTotalSen)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1.5 mt-1.5 font-bold">
                <span>{t("rider.invoice-total", lang)}</span><span className="tabular-nums">{formatRM(inv.totalSen)}</span>
              </div>
              {inv.payments.length > 0 && (
                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-100">
                  <span>{t("rider.paid", lang)} · {inv.payments[0].method}</span>
                  <span>{inv.payments[0].paidAt ? inv.payments[0].paidAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {invoices.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("rider.no-invoices", lang)}</p>}
      </div>
    </div>
  );
}
