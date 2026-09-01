import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import { fmtDate } from "@/lib/format";
import { PageTransition } from "@/components/shared/page-transition";
import { InvoicePaymentPanel } from "@/components/workshop/invoice-payment-panel";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { key: string; labelKey: string }[] = [
  { key: "", labelKey: "ws.jobs.all" },
  { key: "ISSUED", labelKey: "inv.issued" },
  { key: "PAID", labelKey: "inv.paid" },
];

export default async function WorkshopInvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const lang = await getLang();
  const session = await getSessionUser();
  // 仅员工可查看
  if (session.kind !== "staff") {
    return <p className="text-sm text-muted-foreground p-8">{t("common.denied", lang)}</p>;
  }
  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  const invoices = await db.invoice.findMany({
    where,
    include: {
      job: { include: { customer: { select: { id: true, name: true } }, motorcycle: { select: { brand: true, model: true, plate: true } } } },
      payments: true,
    },
    orderBy: { issuedAt: "desc" },
  });
  const statusCounts: Record<string, number> = {};
  for (const inv of invoices) statusCounts[inv.status] = (statusCounts[inv.status] ?? 0) + 1;
  const allCount = invoices.length;

  return (
    <PageTransition>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("inv.page-title", lang)}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("inv.page-sub", lang)} · {allCount} {t("inv.invoices", lang)}</p>

        {/* status filter pills with counts */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 mb-4">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.key || "all"}
              href={"/workshop/finance/invoices" + (f.key ? "?status=" + f.key : "")}
              className={"rounded-full border px-3 py-1 text-xs font-medium transition-colors " + ((sp.status ?? "") === f.key ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}
            >
              {t(f.labelKey, lang)} <span className="ml-1 tabular-nums text-muted-foreground/70">{f.key ? (statusCounts[f.key] ?? 0) : allCount}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {invoices.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("inv.empty", lang)}</p>}
          {invoices.map((inv) => {
            const paidSen = inv.payments.filter((p) => p.status === "PAID" && p.method !== "PAY_LATER").reduce((s, p) => s + p.amountSen, 0);
            return (
              <div key={inv.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-sm font-semibold">{inv.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {inv.job ? <>
                        <Link href={"/workshop/jobs/" + inv.job.id} className="text-primary hover:underline">{inv.job.jobNumber}</Link> · {inv.job.customer.name} · {inv.job.motorcycle.brand} {inv.job.motorcycle.model} · {inv.job.motorcycle.plate}
                      </> : t("inv.no-job", lang)}
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 mt-0.5">{fmtDate(inv.issuedAt)}</div>
                  </div>
                  <div className="text-right">
                    <span className={"rounded-full px-2.5 py-1 text-[11px] font-bold " + (inv.status === "PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300")}>
                      {inv.status === "PAID" ? t("inv.paid", lang) : t("inv.issued", lang)}
                    </span>
                    <div className="mt-1 text-xs text-muted-foreground">{t("inv.total", lang)} <span className="font-bold text-foreground tabular-nums">{formatRM(inv.totalSen)}</span></div>
                  </div>
                </div>
                <div className="mt-3">
                  <InvoicePaymentPanel invoice={{ id: inv.id, invoiceNumber: inv.invoiceNumber, status: inv.status, totalSen: inv.totalSen, paidSen }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
