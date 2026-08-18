import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Money } from "@/components/shared/money";
import { RevenueTrendChart, RevenueSplitChart } from "@/components/workshop/profit-charts";
import { financeService } from "@/modules/finance/service";
import { formatRM } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProfitPage() {
  const p = await financeService.profitDashboard(90);
  return (
    <div>
      <PageHeader title="Profit Dashboard" subtitle={"Revenue = Sales · Gross Profit = Revenue − COGS · Margin = GP / Revenue × 100 (§38)"} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Sales (90 days)" value={<Money sen={p.revenue} />} />
        <StatCard label="Gross Profit" value={<Money sen={p.grossProfit} />} tone="success" />
        <StatCard label="Net Profit" value={<Money sen={p.grossProfit} />} sub="Prototype: no opex model yet" />
        <StatCard label="Average Ticket" value={<Money sen={p.avgTicket} />} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-1">Revenue & Gross Profit Trend</h3>
          <p className="text-xs text-muted-foreground mb-3">Last 90 days · daily</p>
          <RevenueTrendChart data={p.trend} />
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-1">Revenue Split</h3>
          <p className="text-xs text-muted-foreground mb-3">Service vs parts (90 days)</p>
          <RevenueSplitChart service={p.serviceRevenue} parts={p.partsRevenue} />
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Service</span><span className="tabular-nums">{formatRM(p.serviceRevenue)}</span></div>
            <div className="flex justify-between"><span>Parts</span><span className="tabular-nums">{formatRM(p.partsRevenue)}</span></div>
            <div className="flex justify-between border-t pt-1.5 font-semibold"><span>Margin</span><span className="tabular-nums">{p.margin.toFixed(1)}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
