import Link from "next/link";
import { db } from "@/lib/db";
import { salesAnalytics, serviceAnalytics, customerAnalytics, revenueAnalytics, inventoryAnalytics, branchComparison, monthlyServiceAnalytics, brandAnalytics } from "@/modules/analytics/service";
import { AnalyticsTabs } from "@/components/workshop/analytics-tabs";
import { formatRM } from "@/lib/money";
import { PageTransition } from "@/components/shared/page-transition";

export const dynamic = "force-dynamic";

const PERIODS = [
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
  { key: "365", label: "12 months", days: 365 },
];

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string; from?: string; to?: string }> }) {
  const sp = await searchParams;
  // from/to 自定义范围优先；否则快捷周期
  const from = sp.from;
  const to = sp.to;
  let sinceDays = PERIODS.some((p) => p.key === sp.days) ? Number(sp.days) : 30;
  let untilDays = 0;
  if (from) {
    const now = new Date();
    const f = new Date(from + "T00:00:00Z");
    const t = to ? new Date(to + "T00:00:00Z") : now;
    sinceDays = Math.max(1, Math.ceil((now.getTime() - f.getTime()) / 86400000));
    untilDays = Math.max(0, Math.ceil((now.getTime() - t.getTime()) / 86400000));
    if (untilDays >= sinceDays) { sinceDays = 1; untilDays = 0; }
  }
  const months = Math.max(1, Math.ceil((sinceDays - untilDays) / 30)); // 月度视图按月数对齐

  const org = await db.organisation.findFirst();
  const orgId = org!.id;
  const [sales, service, customers, revenue, inventory, branches, monthly, brands] = await Promise.all([
    salesAnalytics(orgId, sinceDays, untilDays), serviceAnalytics(orgId, sinceDays, untilDays), customerAnalytics(orgId, sinceDays, untilDays), revenueAnalytics(orgId, sinceDays, untilDays), inventoryAnalytics(orgId), branchComparison(orgId),
    monthlyServiceAnalytics(orgId, months), brandAnalytics(orgId, sinceDays, untilDays),
  ]);
  const maxMonth = Math.max(...monthly.map((m) => m.count), 1);
  const maxBrand = Math.max(...brands.map((b) => b.count), 1);

  const qs = (d: string) => "/workshop/analytics?days=" + d;
  const rangeLabel = from ? from + " → " + (to ?? "today") : "";

  return (
    <PageTransition>
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Consistent calculation rules with the dashboard (ANA-051){rangeLabel ? " · " + rangeLabel : ""}</p>
        </div>
        <div data-tut="analytics-range" className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <Link key={p.key} href={qs(p.key)} className={"rounded-full border px-3 py-1 text-xs font-medium transition-colors " + (!from && sinceDays === p.days && untilDays === 0 ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
              {p.label}
            </Link>
          ))}
          <form method="get" className="flex items-center gap-1 ml-2 text-xs">
            <input type="date" name="from" defaultValue={from} className="rounded-md border bg-background px-2 py-1.5" />
            <span className="text-muted-foreground">→</span>
            <input type="date" name="to" defaultValue={to} className="rounded-md border bg-background px-2 py-1.5" />
            <button className="rounded-md border px-2 py-1.5 font-medium">Go</button>
          </form>
        </div>
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
      <div data-tut="analytics-chart" className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold mb-1">Monthly services</h3>
        <p className="text-xs text-muted-foreground mb-4">Completed jobs & unique motorcycles per month (last {months} month{months > 1 ? "s" : ""})</p>
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
        <p className="text-xs text-muted-foreground mb-4">Services by motorcycle brand ({from ? from + " → " + (to ?? "today") : "last " + sinceDays + " days"})</p>
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
