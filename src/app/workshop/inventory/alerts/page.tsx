import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { inventoryService } from "@/modules/inventory/service";
import { db } from "@/lib/db";
import { ReorderActions } from "@/components/workshop/reorder-actions";

export const dynamic = "force-dynamic";

export default async function StockAlertsPage() {
  const branch = await db.branch.findFirst({ where: { isMain: true } });
  const rows = await inventoryService.stockStatus(branch!.id);
  const alerts = rows.filter((r) => r.level === "CRITICAL" || r.level === "OUT_OF_STOCK" || r.level === "LOW");
  return (
    <div>
      <PageHeader title="Stock Alerts" subtitle="Low / critical / out of stock — reorder before you run out" />
      <div className="space-y-2">
        {alerts.map((r) => (
          <div key={r.productId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="flex-1 min-w-44">
              <div className="font-medium text-sm">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.sku} · {r.reason ?? r.level}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums">{r.quantity} <span className="text-xs font-normal text-muted-foreground">/ min {r.minStock}</span></div>
            </div>
            <div className="text-sm font-semibold tabular-nums"><Money sen={r.valueSen} /></div>
            <ReorderActions productId={r.productId} productName={r.name} quantity={r.quantity} recommended={r.recommendedReorderQty || r.minStock * 2} />
          </div>
        ))}
        {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">All stock healthy.</p>}
      </div>
    </div>
  );
}
