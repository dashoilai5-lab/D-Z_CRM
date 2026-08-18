import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { inventoryService } from "@/modules/inventory/service";
import { db } from "@/lib/db";
import { ReorderActions } from "@/components/workshop/reorder-actions";

export const dynamic = "force-dynamic";

export default async function ReorderPage() {
  const branch = await db.branch.findFirst({ where: { isMain: true } });
  const recs = await inventoryService.reorderRecommendations(branch!.id);
  const suppliers = await inventoryService.suppliers();
  return (
    <div>
      <PageHeader title="Auto Reorder" subtitle={"Reorder point = avg daily usage × lead time + safety stock (§37)"} />
      <div className="space-y-2">
        {recs.map((r) => {
          const sup = suppliers.find((s) => s.id === r.supplierId);
          return (
            <div key={r.productId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
              <div className="flex-1 min-w-44">
                <div className="font-medium text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground">Current stock {r.quantity} · est days left {r.daysRemaining ?? "—"} · {r.reason}</div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">Recommended: {r.recommendedReorderQty || r.minStock * 2}×</div>
                <div className="text-xs text-muted-foreground">{sup?.name ?? "—"} · lead {r.leadTimeDays ?? "—"} days</div>
              </div>
              <div className="text-sm font-semibold tabular-nums"><Money sen={r.valueSen} /></div>
              <ReorderActions productId={r.productId} productName={r.name} quantity={r.quantity} recommended={r.recommendedReorderQty || r.minStock * 2} />
            </div>
          );
        })}
        {recs.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No reorder recommendations right now.</p>}
      </div>
    </div>
  );
}
