import type { KpiStaff } from "@/types";
import type { IStaffRepository } from "./repository";
import { PrismaStaffRepository } from "@/repositories/prisma/staff.repository";
import { calculateKpiScore } from "@/lib/state-machines";
import { db } from "@/lib/db";

/**
 * Staff KPI (§33) — fully deterministic and explainable, never AI-invented.
 * Score = 0.30×jobs + 0.20×ticket + 0.15×package + 0.15×addon + 0.10×checklist + 0.10×rating
 */
export class StaffService {
  constructor(private repo: IStaffRepository = new PrismaStaffRepository()) {}

  /** Foreman 周期结算：按日/周/月聚合完成工单 + 服务金额 + 附加 + 工时（老板视角，纯查询）。 */
  async settlement(period: "day" | "week" | "month", ref?: Date): Promise<{
    period: string; start: Date; end: Date;
    foremen: { id: string; name: string; jobs: number; salesSen: number; avgTicketSen: number; addonJobs: number; hours: number; jobsList: { id: string; jobNumber: string; serviceType: string; packageName: string | null; completedAt: Date; salesSen: number }[] }[];
    totals: { jobs: number; salesSen: number; hours: number };
  }> {
    // +8 业务时区（Asia/Kuala_Lumpur）的周期窗口 → UTC 边界
    const base = ref ?? new Date();
    const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(base).split("-").map(Number);
    const [y, m, d] = ymd as [number, number, number];
    const dayStartUtc = Date.UTC(y, m - 1, d) - 8 * 3600000; // +8 当日 00:00 = UTC 前日 16:00
    let start: Date; let end: Date;
    if (period === "day") {
      start = new Date(dayStartUtc);
      end = new Date(dayStartUtc + 86400000);
    } else if (period === "week") {
      // 周一为一周起点（+8 视角）
      const dow = new Date(dayStartUtc + 8 * 3600000).getUTCDay(); // 0=Sun
      const mondayOffset = (dow + 6) % 7;
      start = new Date(dayStartUtc - mondayOffset * 86400000);
      end = new Date(start.getTime() + 7 * 86400000);
    } else {
      start = new Date(Date.UTC(y, m - 1, 1) - 8 * 3600000);
      end = new Date(Date.UTC(y, m, 1) - 8 * 3600000);
    }

    const users = await this.repo.listUsers();
    const foremen: { id: string; name: string; jobs: number; salesSen: number; avgTicketSen: number; addonJobs: number; hours: number; jobsList: { id: string; jobNumber: string; serviceType: string; packageName: string | null; completedAt: Date; salesSen: number }[] }[] = [];

    for (const u of users) {
      const jobs = u.jobs.filter((j) => j.status === "COMPLETED" && j.completedAt && j.completedAt >= start && j.completedAt < end);
      if (jobs.length === 0) continue;
      const jobIds = jobs.map((j) => j.id);
      const [items, invoices] = await Promise.all([
        db.serviceJobItem.findMany({ where: { jobId: { in: jobIds }, status: { not: "DECLINED" } } }),
        db.invoice.findMany({ where: { jobId: { in: jobIds } } }),
      ]);
      const salesByJob = new Map<string, number>();
      for (const inv of invoices) if (inv.jobId) salesByJob.set(inv.jobId, (salesByJob.get(inv.jobId) ?? 0) + inv.totalSen);
      const addonJobs = new Set<string>();
      for (const it of items) if (it.source === "COUNTER" || it.source === "APPROVAL") addonJobs.add(it.jobId);
      const totalSales = [...salesByJob.values()].reduce((s, v) => s + v, 0);
      const hours = jobs.reduce((s2, j) => {
        const endT = j.completedAt ?? j.createdAt;
        const startT = j.startedAt ?? j.createdAt;
        return s2 + Math.max(0, (endT.getTime() - startT.getTime()) / 3600000);
      }, 0);

      foremen.push({
        id: u.id, name: u.name, jobs: jobs.length, salesSen: totalSales,
        avgTicketSen: jobs.length ? Math.round(totalSales / jobs.length) : 0,
        addonJobs: addonJobs.size, hours: Math.round(hours * 10) / 10,
        jobsList: jobs.map((j) => ({ id: j.id, jobNumber: j.jobNumber, serviceType: j.packageName ?? j.customerRequest ?? "", packageName: j.packageName, completedAt: j.completedAt!, salesSen: salesByJob.get(j.id) ?? 0 })).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()),
      });
    }
    foremen.sort((a, b) => b.salesSen - a.salesSen);
    return {
      period, start, end,
      foremen,
      totals: { jobs: foremen.reduce((s, f) => s + f.jobs, 0), salesSen: foremen.reduce((s, f) => s + f.salesSen, 0), hours: Math.round(foremen.reduce((s, f) => s + f.hours, 0) * 10) / 10 },
    };
  }

  async kpiBoard(days = 30): Promise<{ staff: KpiStaff[]; top: KpiStaff | null }> {
    const users = await this.repo.listUsers();
    const cutoff = new Date(Date.now() - days * 86400000);
    const staff: KpiStaff[] = [];

    for (const u of users) {
      const jobs = u.jobs.filter((j) => j.status === "COMPLETED" && (j.completedAt ?? j.createdAt) >= cutoff);
      if (jobs.length === 0 && u.role !== "MECHANIC") continue;
      const jobIds = jobs.map((j) => j.id);
      if (jobIds.length === 0) {
        staff.push({ id: u.id, name: u.name, role: u.role, jobs: 0, salesSen: 0, avgTicketSen: 0, packageConversion: 0, addonConversion: 0, checklistCompletion: 0, rating: 0, score: 0 });
        continue;
      }
      const [items, parts, checklists, reviews] = await Promise.all([
        db.serviceJobItem.findMany({ where: { jobId: { in: jobIds }, status: { not: "DECLINED" } } }),
        db.serviceJobPart.findMany({ where: { jobId: { in: jobIds }, status: { not: "DECLINED" } } }),
        db.checklistExecution.findMany({ where: { jobId: { in: jobIds } }, include: { items: true } }),
        db.review.findMany({ where: { jobId: { in: jobIds }, rating: { not: null } } }),
      ]);
      const invoices = await db.invoice.findMany({ where: { jobId: { in: jobIds } } });
      const sales = invoices.reduce((s, i) => s + i.totalSen, 0);
      const withPackage = jobs.filter((j) => j.packageName).length;
      const jobsWithAddon = new Set<string>();
      for (const it of items) if (it.source === "COUNTER" || it.source === "APPROVAL") jobsWithAddon.add(it.jobId);
      for (const p of parts) if (p.source === "COUNTER") jobsWithAddon.add(p.jobId);
      const checklistRates = checklists.map((c) => (c.items.length ? c.items.filter((i) => i.result !== "NA").length / c.items.length : 0));
      const checklistCompletion = checklistRates.length ? (checklistRates.reduce((s2, r) => s2 + r, 0) / checklistRates.length) * 100 : 0;
      const rating = reviews.length ? reviews.reduce((s2, r) => s2 + r.rating!, 0) / reviews.length : 0;
      const avgTicket = sales / jobs.length;
      const packageConversion = (withPackage / jobs.length) * 100;
      const addonConversion = (jobsWithAddon.size / jobs.length) * 100;

      const score = calculateKpiScore({
        jobs: jobs.length,
        avgTicketSen: Math.round(avgTicket),
        packageConversion,
        addonConversion,
        checklistCompletion,
        rating,
      });

      staff.push({
        id: u.id, name: u.name, role: u.role, jobs: jobs.length, salesSen: sales, avgTicketSen: Math.round(avgTicket),
        packageConversion: Math.round(packageConversion * 10) / 10,
        addonConversion: Math.round(addonConversion * 10) / 10,
        checklistCompletion: Math.round(checklistCompletion * 10) / 10,
        rating: Math.round(rating * 10) / 10,
        score,
      });
    }
    const sorted = staff.sort((a, b) => b.score - a.score);
    return { staff: sorted, top: sorted[0] ?? null };
  }
}

export const staffService = new StaffService();
