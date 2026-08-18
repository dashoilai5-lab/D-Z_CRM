import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike } from "@/modules/customers/repository";

export interface IInspectionRepository {
  listTemplates(client?: DbLike): Promise<Prisma.ChecklistTemplateGetPayload<{ include: { items: true } }>[]>;
  getTemplate(id: string, client?: DbLike): Promise<Prisma.ChecklistTemplateGetPayload<{ include: { items: true } }> | null>;
  getExecutionForJob(jobId: string, client?: DbLike): Promise<Prisma.ChecklistExecutionGetPayload<{ include: { items: true } }> | null>;
  createExecution(data: Prisma.ChecklistExecutionCreateInput, client?: DbLike): Promise<Prisma.ChecklistExecutionGetPayload<{ include: { items: true } }>>;
  updateExecutionItem(id: string, data: Prisma.ChecklistExecutionItemUpdateInput, client?: DbLike): Promise<unknown>;
  completeExecution(id: string, client?: DbLike): Promise<unknown>;
  createFinding(data: Prisma.InspectionFindingCreateInput, client?: DbLike): Promise<Prisma.InspectionFindingGetPayload<{ include: { approval: true } }>>;
  createApproval(data: Prisma.CustomerApprovalCreateInput, client?: DbLike): Promise<unknown>;
  updateApproval(id: string, data: Prisma.CustomerApprovalUpdateInput, client?: DbLike): Promise<unknown>;
  updateFinding(id: string, data: Prisma.InspectionFindingUpdateInput, client?: DbLike): Promise<unknown>;
  listApprovalsForCustomer(customerId: string, client?: DbLike): Promise<Prisma.CustomerApprovalGetPayload<{ include: { job: { include: { motorcycle: true; customer: true } }; finding: true } }>[]>;
}

export type { DbLike } from "@/modules/customers/repository";
