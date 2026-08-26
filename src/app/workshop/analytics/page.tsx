import { db } from "@/lib/db";
import { salesAnalytics, serviceAnalytics, customerAnalytics, revenueAnalytics, inventoryAnalytics, branchComparison, monthlyServiceAnalytics, brandAnalytics } from "@/modules/analytics/service";
import { AnalyticsTabs } from "@/components/workshop/analytics-tabs";
import { formatRM } from "@/lib/money";
import { PageTransition } from "@/components/shared/page-transition";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const org = await db.organisation.findFirst();
  const orgId = org!.id;
  const [sales, service, customers, revenue, inventory, branches, monthly, brands] = await Promise.all([
    salesAnalytics(orgId), serviceAnalytics(orgId), customerAnalytics(orgId), revenueAnalytics(orgId), inventoryAnalytics(orgId), branchComparison(orgId),
    monthlyServiceAnalytics(orgId), brandAnalytics(orgId),
  ]);
  const maxMonth = Math.max(...monthly.map((m) => m.count), 1);
  const maxBrand = Math.max(...brands.map((b) => b.count), 1);

  return (
    <PageTransition>
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days · consistent calculation rules with the dashboard (ANA-051)</p>
      </div>
      <AnalyticsTabs
        sales={sales}
        service={service}
        customers={customers}
        revenue={{ ...revenue, totalLabel: formatRM(revenue.total), prevLabel: formatRM(revenue.prevTotal), repeatLabel: formatRM(revenue.repeatRevenue), avgLabel: formatRM(revenue.avgPerCustomer) }}
        inventory={{ ...inventory, lowStockList: inventory.lowStockList.map((i) => ({ label: i.label, value: i.qty })) }}
        branches={branches.map((b) => ({ ...b, revenueLabel: formatRM(b.revenue) }))}
      />

      {/* 月度服务量 */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold mb-1">Monthly services</h3>
        <p className="text-xs text-muted-foreground mb-4">Completed jobs & unique motorcycles per month (last 12 months)</p>
        <div className="space-y-2">
          {monthly.map((m) => (
            <div key={m.key} className="flex items-center gap-3 text-xs">
              <span className="w-16 shrink-0 font-mono text-muted-foreground">{m.label}</span>
              <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden">
                <div className="h-full rounded bg-primary/80 flex items-center justify-end pr-1.5 text-[10px] font-bold text-primary-foreground" style={{ width: Math.max(4, (m.count / maxMonth) * 100) + "%" }}>
                  {m.count > 0 ? m.count : ""}
                </div>
              </div>
              <span className="w-24 shrink-0 text-right text-muted-foreground">{m.count} jobs · {m.vehicles} bikes</span>
            </div>
          ))}
        </div>
      </div>

      {/* 品牌分析 */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold mb-1">Brand analysis</h3>
        <p className="text-xs text-muted-foreground mb-4">Services by motorcycle brand (last 12 months)</p>
        {brands.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No data.</p>}
        <div className="space-y-3">
          {brands.map((b) => (
            <div key={b.brand}>
              <div className="flex items-center gap-3 text-xs mb-1">
                <span className="w-28 shrink-0 font-semibold">{b.brand}</span>
                <span className="text-muted-foreground">{b.count} jobs · {b.vehicles} bikes · {formatRM(b.salesSen)} · {b.share}%</span>
              </div>
              <div className="h-4 rounded bg-muted/50 overflow-hidden">
                <div className="h-full rounded bg-primary/70" style={{ width: Math.max(2, (b.count / maxBrand) * 100) + "%" }} />
              </div>
              {b.topModels.length > 0 && (
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Top: {b.topModels.map((t) => t.model + " ×" + t.n).join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
