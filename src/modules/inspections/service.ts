import type { DbLike } from "@/modules/customers/repository";
import type { CheckResult, Prisma, PrismaClient } from "@prisma/client";
import type { IInspectionRepository } from "./repository";
import { PrismaInspectionRepository } from "@/repositories/prisma/inspections.repository";
import { db } from "@/lib/db";

export class InspectionService {
  constructor(private repo: IInspectionRepository = new PrismaInspectionRepository()) {}

  async startChecklist(jobId: string, templateId?: string) {
    const existing = await this.repo.getExecutionForJob(jobId);
    if (existing) return existing;
    const template = templateId
      ? await this.repo.getTemplate(templateId)
      : (await this.repo.listTemplates()).find((t) => t.isDefault) ?? (await this.repo.listTemplates())[0];
    if (!template) throw new Error("No checklist template available");
    return db.$transaction(async (tx: DbLike) => {
      const exec = await this.repo.createExecution({ job: { connect: { id: jobId } }, templateId: template.id }, tx);
      for (const item of template.items) {
        await (tx as PrismaClient).checklistExecutionItem.create({
          data: { executionId: exec.id, checklistItemId: item.id, name: item.name, result: "NA" },
        });
      }
      return this.repo.getExecutionForJob(jobId, tx);
    });
  }

  async setResult(jobId: string, executionItemId: string, result: CheckResult, note?: string) {
    await this.repo.updateExecutionItem(executionItemId, { result, note: note ?? null });
    return this.repo.getExecutionForJob(jobId);
  }

  /** Request customer approval for a finding (§25-26). Job goes AWAITING_APPROVAL. */
  async requestApproval(input: {
    jobId: string; executionItemId?: string; title: string; severity: "WARNING" | "FAIL";
    note: string; recommendedRepair: string; priceSen: number;
  }) {
    return db.$transaction(async (tx: DbLike) => {
      const finding = await this.repo.createFinding(
        {
          job: { connect: { id: input.jobId } },
          executionItemId: input.executionItemId,
          title: input.title,
          severity: input.severity,
          note: input.note,
          recommendedRepair: input.recommendedRepair,
          priceSen: input.priceSen,
          status: "RECOMMENDED",
        },
        tx
      );
      await this.repo.createApproval(
        {
          job: { connect: { id: input.jobId } },
          finding: { connect: { id: finding.id } },
          title: input.recommendedRepair,
          description: input.note,
          amountSen: input.priceSen,
          status: "PENDING",
        },
        tx
      );
      await (tx as PrismaClient).serviceJob.update({
        where: { id: input.jobId },
        data: { status: "AWAITING_APPROVAL" },
      });
      return finding;
    });
  }

  /** Customer responds: APPROVED adds the recommended repair to the job; DECLINED records the decline. */
  async respondApproval(approvalId: string, decision: "APPROVED" | "DECLINED") {
    return db.$transaction(async (tx: DbLike) => {
      const approval = await (tx as PrismaClient).customerApproval.findUnique({
        where: { id: approvalId },
        include: { job: true, finding: true },
      });
      if (!approval || approval.status !== "PENDING") throw new Error("Approval not pending");
      const respondedAt = new Date();
      await this.repo.updateApproval(approvalId, { status: decision, respondedAt }, tx);
      await this.repo.updateFinding(
        approval.findingId,
        decision === "APPROVED" ? { status: "APPROVED" } : { status: "DECLINED" },
        tx
      );
      if (decision === "APPROVED" && approval.finding) {
        await (tx as PrismaClient).serviceJobItem.create({
          data: {
            jobId: approval.jobId,
            description: approval.finding.recommendedRepair ?? approval.title,
            kind: "FEE",
            quantity: 1,
            unitPriceSen: approval.amountSen,
            lineTotalSen: approval.amountSen,
            status: "ACCEPTED",
            source: "APPROVAL",
          },
        });
      }
      const pending = await (tx as PrismaClient).customerApproval.count({
        where: { jobId: approval.jobId, status: "PENDING" },
      });
      if (pending === 0 && approval.job.status === "AWAITING_APPROVAL") {
        await (tx as PrismaClient).serviceJob.update({ where: { id: approval.jobId }, data: { status: "IN_PROGRESS" } });
      }
      return { decision, jobId: approval.jobId };
    });
  }

  async listForCustomer(customerId: string) {
    const rows = await this.repo.listApprovalsForCustomer(customerId);
    return rows.map((a) => ({
      id: a.id, title: a.title, description: a.description, amountSen: a.amountSen, status: a.status,
      requestedAt: a.requestedAt, respondedAt: a.respondedAt,
      job: {
        id: a.job.id, jobNumber: a.job.jobNumber, status: a.job.status,
        motorcycle: { brand: a.job.motorcycle.brand, model: a.job.motorcycle.model, plate: a.job.motorcycle.plate },
      },
    }));
  }
}

export const inspectionService = new InspectionService();
