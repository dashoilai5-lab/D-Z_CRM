import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Money } from "@/components/shared/money";
import { RevenueTrendChart, RevenueSplitChart } from "@/components/workshop/profit-charts";
import { financeService } from "@/modules/finance/service";
import { formatRM } from "@/lib/money";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ProfitPage() {
  const lang = await getLang();
  const p = await financeService.profitDashboard(90);
  return (
    <div>
      <PageHeader title={t("nav.profit", lang)} subtitle={t("ws.finance.profit.subtitle", lang)} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label={t("ws.finance.sales-90", lang)} value={<Money sen={p.revenue} />} />
        <StatCard label={t("dash.gross-profit", lang)} value={<Money sen={p.grossProfit} />} tone="success" />
        <StatCard label={t("ws.finance.net-profit", lang)} value={<Money sen={p.grossProfit} />} sub={t("ws.finance.no-opex", lang)} />
        <StatCard label={t("dash.avg-ticket", lang)} value={<Money sen={p.avgTicket} />} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 dz-panel p-5">
          <h3 className="font-semibold mb-1">{t("ws.finance.trend-title", lang)}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t("ws.finance.trend-sub", lang)}</p>
          <RevenueTrendChart data={p.trend} />
        </div>
        <div className="dz-panel p-5">
          <h3 className="font-semibold mb-1">{t("ws.finance.split-title", lang)}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t("ws.finance.split-sub", lang)}</p>
          <RevenueSplitChart service={p.serviceRevenue} parts={p.partsRevenue} />
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>{t("rider.service", lang)}</span><span className="tabular-nums">{formatRM(p.serviceRevenue)}</span></div>
            <div className="flex justify-between"><span>{t("ws.finance.parts", lang)}</span><span className="tabular-nums">{formatRM(p.partsRevenue)}</span></div>
            <div className="flex justify-between border-t pt-1.5 font-semibold"><span>{t("ws.finance.margin", lang)}</span><span className="tabular-nums">{p.margin.toFixed(1)}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
