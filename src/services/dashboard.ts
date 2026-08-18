import { jobService } from "@/modules/service-jobs/service";
import { financeService } from "@/modules/finance/service";
import { crmService } from "@/modules/crm/service";
import { inventoryService } from "@/modules/inventory/service";
import { staffService } from "@/modules/staff/service";
import { db } from "@/lib/db";

/** Workshop dashboard aggregates (§17). */
export class DashboardService {
  async get(branchId?: string) {
    const [board, finance, reminders, reviews, kpi] = await Promise.all([
      jobService.listBoard(),
      this.todayFinance(),
      crmService.reminders(),
      crmService.reviews(),
      staffService.kpiBoard(30),
    ]);
    const criticalStock = branchId ? await inventoryService.criticalStockCount(branchId) : 0;
    const deadStockValue = branchId ? await inventoryService.deadStockValue(branchId) : 0;
    const customersDue = reminders.filter((r) => r.status === "DUE" || r.status === "OVERDUE").length;
    return {
      todaySales: finance.revenue,
      todayGrossProfit: finance.grossProfit,
      jobsToday: board.jobsToday,
      avgTicket: board.jobsToday ? Math.round(finance.revenue / board.jobsToday) : 0,
      statuses: board.counts,
      customersDue,
      criticalStock,
      deadStockValue,
      avgRating: Math.round(reviews.avg * 10) / 10,
      topPerformer: kpi.top,
      board,
    };
  }

  private async todayFinance() {
    const invoices = await db.invoice.findMany({
      where: { status: { not: "DRAFT" } },
      include: { job: { include: { parts: true } } },
    });
    const now = new Date();
    const today = invoices.filter((i) => {
      const d = new Date(i.issuedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    });
    const revenue = today.reduce((s, i) => s + i.totalSen, 0);
    const cogs = today.reduce((s, i) => {
      const parts = i.job?.parts.filter((p) => p.status !== "DECLINED") ?? [];
      return s + parts.reduce((s2, p) => s2 + p.unitCostSen * p.quantity, 0);
    }, 0);
    return { revenue, grossProfit: revenue - cogs };
  }
}

export const dashboardService = new DashboardService();
