import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { inventoryService } from "@/modules/inventory/service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const LEVEL: Record<string, string> = {
  HEALTHY: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  LOW: "bg-amber-50 text-amber-700 ring-amber-200",
  CRITICAL: "bg-red-50 text-red-700 ring-red-200",
  OUT_OF_STOCK: "bg-slate-100 text-slate-700 ring-slate-300",
};

export default async function StockPage() {
  const branch = await db.branch.findFirst({ where: { isMain: true } });
  const rows = await inventoryService.stockStatus(branch!.id);
  return (
    <div>
      <PageHeader title="Stock" subtitle="Branch: Kuala Lumpur · quantity vs minimum + sales velocity" />
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Min</th><th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Est. Days Left</th><th className="px-4 py-3 font-medium">Level</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.productId} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{r.name}<div className="text-xs text-muted-foreground font-mono">{r.sku}</div></td>
                  <td className="px-4 py-2.5 tabular-nums font-semibold">{r.quantity}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{r.minStock}</td>
                  <td className="px-4 py-2.5 tabular-nums"><Money sen={r.valueSen} /></td>
                  <td className="px-4 py-2.5 tabular-nums">{r.daysRemaining ?? "—"}</td>
                  <td className="px-4 py-2.5"><span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 " + (LEVEL[r.level] ?? "")}>{r.level.replace("_", " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
