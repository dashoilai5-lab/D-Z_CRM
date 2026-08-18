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
