import { db } from "@/lib/db";
import { salesAnalytics, serviceAnalytics, customerAnalytics, revenueAnalytics, inventoryAnalytics, branchComparison } from "@/modules/analytics/service";
import { AnalyticsTabs } from "@/components/workshop/analytics-tabs";
import { formatRM } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const org = await db.organisation.findFirst();
  const orgId = org!.id;
  const [sales, service, customers, revenue, inventory, branches] = await Promise.all([
    salesAnalytics(orgId), serviceAnalytics(orgId), customerAnalytics(orgId), revenueAnalytics(orgId), inventoryAnalytics(orgId), branchComparison(orgId),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days · consistent calculation rules with the dashboard (ANA-051)</p>
      </div>
      <AnalyticsTabs
        sales={sales}
        service={service}
        customers={customers}
        revenue={{ ...revenue, totalLabel: formatRM(revenue.total), repeatLabel: formatRM(revenue.repeatRevenue), avgLabel: formatRM(revenue.avgPerCustomer) }}
        inventory={{ ...inventory, lowStockList: inventory.lowStockList.map((i) => ({ label: i.label, value: i.qty })) }}
        branches={branches.map((b) => ({ ...b, revenueLabel: formatRM(b.revenue) }))}
      />
    </div>
  );
}
