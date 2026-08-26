import { PageHeader } from "@/components/shared/page-header";
import { InvoiceList } from "@/components/workshop/invoice-list";
import { db } from "@/lib/db";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Workshop 发票结清：tick 批量结清 + split 收款。 */
export default async function InvoicesPage() {
  const lang = await getLang();
  const invoices = await db.invoice.findMany({
    include: { customer: { select: { name: true } }, payments: { select: { amountSen: true, status: true } } },
    orderBy: { issuedAt: "desc" },
  });
  const rows = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    totalSen: inv.totalSen,
    paidSen: inv.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amountSen, 0),
    customerName: inv.customer.name,
    issuedAt: fmtDate(inv.issuedAt),
  }));

  return (
    <div>
      <PageHeader title={t("inv.title", lang)} subtitle={t("inv.subtitle", lang)} />
      <InvoiceList invoices={rows} lang={lang} />
    </div>
  );
}
