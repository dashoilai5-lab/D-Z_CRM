import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike, IInspectionRepository } from "@/modules/inspections/repository";
import { db } from "@/lib/db";

export class PrismaInspectionRepository implements IInspectionRepository {
  private c(client?: DbLike): PrismaClient | Prisma.TransactionClient {
    return client ?? db;
  }
  listTemplates(client?: DbLike) {
    return this.c(client).checklistTemplate.findMany({ include: { items: { orderBy: { order: "asc" } } } });
  }
  getTemplate(id: string, client?: DbLike) {
    return this.c(client).checklistTemplate.findUnique({ where: { id }, include: { items: { orderBy: { order: "asc" } } } });
  }
  getExecutionForJob(jobId: string, client?: DbLike) {
    return this.c(client).checklistExecution.findUnique({ where: { jobId }, include: { items: { orderBy: { createdAt: "asc" } } } });
  }
  createExecution(data: Prisma.ChecklistExecutionCreateInput, client?: DbLike) {
    return this.c(client).checklistExecution.create({ data, include: { items: true } });
  }
  updateExecutionItem(id: string, data: Prisma.ChecklistExecutionItemUpdateInput, client?: DbLike) {
    return this.c(client).checklistExecutionItem.update({ where: { id }, data });
  }
  completeExecution(id: string, client?: DbLike) {
    return this.c(client).checklistExecution.update({ where: { id }, data: { completedAt: new Date() } });
  }
  createFinding(data: Prisma.InspectionFindingCreateInput, client?: DbLike) {
    return this.c(client).inspectionFinding.create({ data, include: { approval: true } });
  }
  createApproval(data: Prisma.CustomerApprovalCreateInput, client?: DbLike) {
    return this.c(client).customerApproval.create({ data });
  }
  updateApproval(id: string, data: Prisma.CustomerApprovalUpdateInput, client?: DbLike) {
    return this.c(client).customerApproval.update({ where: { id }, data });
  }
  updateFinding(id: string, data: Prisma.InspectionFindingUpdateInput, client?: DbLike) {
    return this.c(client).inspectionFinding.update({ where: { id }, data });
  }
  listApprovalsForCustomer(customerId: string, client?: DbLike) {
    return this.c(client).customerApproval.findMany({
      where: { job: { customerId } },
      include: { job: { include: { motorcycle: true, customer: true } }, finding: true },
      orderBy: { requestedAt: "desc" },
    });
  }
}
