import { getDemoCustomer } from "@/lib/demo-customer";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function RiderInvoicesPage() {
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const invoices = await db.invoice.findMany({
    where: { customerId: customer.id },
    include: { items: true, job: { include: { motorcycle: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold">{inv.invoiceNumber}</span>
              <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-bold " + (inv.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{inv.status}</span>
            </div>
            <div className="mt-2 text-sm font-semibold">{inv.job?.packageName ?? "Service"}</div>
            <div className="text-xs text-muted-foreground">{inv.job?.motorcycle.plate} · {inv.issuedAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div className="mt-3 space-y-1">
              {inv.items.map((i) => (
                <div key={i.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{i.description} ×{i.quantity}</span>
                  <span className="tabular-nums">{formatRM(i.lineTotalSen)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1.5 mt-1.5 font-bold">
                <span>TOTAL</span><span className="tabular-nums">{formatRM(inv.totalSen)}</span>
              </div>
            </div>
          </div>
        ))}
        {invoices.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No invoices yet.</p>}
      </div>
    </div>
  );
}
