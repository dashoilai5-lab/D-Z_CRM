import type { DbLike } from "@/modules/customers/repository";
import type { JobStatus, Prisma, PrismaClient } from "@prisma/client";
import type { IJobRepository } from "./repository";
import { PrismaJobRepository } from "@/repositories/prisma/jobs.repository";
import { db } from "@/lib/db";

export type JobStatusInput = JobStatus;

const STATUS_FLOW: Record<string, JobStatusInput[]> = {
  WAITING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["AWAITING_APPROVAL", "READY", "CANCELLED"],
  AWAITING_APPROVAL: ["IN_PROGRESS", "READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class JobService {
  constructor(private repo: IJobRepository = new PrismaJobRepository()) {}

  canTransition(from: JobStatusInput, to: JobStatusInput): boolean {
    return STATUS_FLOW[from]?.includes(to) ?? false;
  }

  async listBoard() {
    const rows = await this.repo.list();
    const now = new Date();
    const today = (d: Date) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    return {
      jobs: rows.map((j) => {
        const acceptedItems = j.items.filter((i) => i.status !== "DECLINED");
        const acceptedParts = j.parts.filter((p) => p.status !== "DECLINED");
        const totalSen = acceptedItems.reduce((s, i) => s + i.lineTotalSen, 0) + acceptedParts.reduce((s, p) => s + p.lineTotalSen, 0);
        return {
          id: j.id, jobNumber: j.jobNumber, status: j.status, mileage: j.mileage,
          packageName: j.packageName, customerRequest: j.customerRequest,
          customer: { id: j.customer.id, name: j.customer.name, phone: j.customer.phone },
          motorcycle: { brand: j.motorcycle.brand, model: j.motorcycle.model, plate: j.motorcycle.plate, year: j.motorcycle.year },
          mechanic: j.mechanic,
          createdAt: j.createdAt, startedAt: j.startedAt, readyAt: j.readyAt, completedAt: j.completedAt,
          totalSen,
          pendingApprovals: j.approvals.filter((a) => a.status === "PENDING").length,
          isToday: today(j.createdAt),
        };
      }),
      counts: {
        WAITING: rows.filter((r) => r.status === "WAITING").length,
        IN_PROGRESS: rows.filter((r) => r.status === "IN_PROGRESS").length,
        AWAITING_APPROVAL: rows.filter((r) => r.status === "AWAITING_APPROVAL").length,
        READY: rows.filter((r) => r.status === "READY").length,
        COMPLETED: rows.filter((r) => r.status === "COMPLETED").length,
        CANCELLED: rows.filter((r) => r.status === "CANCELLED").length,
      },
      jobsToday: rows.filter((r) => today(r.createdAt)).length,
    };
  }

  async getDetail(id: string) {
    const j = await this.repo.getById(id);
    if (!j) return null;
    const acceptedItems = j.items.filter((i) => i.status !== "DECLINED");
    const acceptedParts = j.parts.filter((p) => p.status !== "DECLINED");
    const totalSen = acceptedItems.reduce((s, i) => s + i.lineTotalSen, 0) + acceptedParts.reduce((s, p) => s + p.lineTotalSen, 0);
    return {
      ...j,
      summary: {
        totalSen,
        itemsSen: acceptedItems.reduce((s, i) => s + i.lineTotalSen, 0),
        partsSen: acceptedParts.reduce((s, p) => s + p.lineTotalSen, 0),
      },
    };
  }

  /** Create a service job (counter flow, §22). Returns the new job id. */
  async create(input: {
    branchId: string; customerId: string; motorcycleId: string; mileage: number;
    customerRequest?: string; packageId?: string; mechanicId?: string;
    addons?: { description: string; kind: string; quantity: number; unitPriceSen: number }[];
  }): Promise<{ id: string; jobNumber: string }> {
    const jobNumber = await this.repo.nextJobNumber();
    const created = await this.repo.create({
      jobNumber,
      branchId: input.branchId,
      customerId: input.customerId,
      motorcycleId: input.motorcycleId,
      mileage: input.mileage,
      customerRequest: input.customerRequest,
      servicePackageId: input.packageId || undefined,
      mechanicId: input.mechanicId || undefined,
      status: "WAITING",
    });
    await this.attachPackage(created.id, input.packageId, input.addons);
    return { id: created.id, jobNumber };
  }

  /** Attach package line items + counter add-ons to a job (INCLUDED). */
  async attachPackage(jobId: string, packageId?: string, addons?: { description: string; kind: string; quantity: number; unitPriceSen: number }[], client?: DbLike) {
    if (client) return this.attachPackageTx(jobId, packageId, addons, client);
    return db.$transaction(async (tx: DbLike) => this.attachPackageTx(jobId, packageId, addons, tx));
  }

  private async attachPackageTx(jobId: string, packageId: string | undefined, addons: { description: string; kind: string; quantity: number; unitPriceSen: number }[] | undefined, tx: DbLike) {
    if (packageId) {
      const pkg = await (tx as PrismaClient).servicePackage.findUnique({ where: { id: packageId }, include: { items: true } });
      if (pkg) {
        // one priced line for the package (§48: "Standard Service RM120")
        await (tx as PrismaClient).serviceJobItem.create({
          data: { jobId, description: pkg.name, kind: "SERVICE", quantity: 1, unitPriceSen: pkg.priceSen, lineTotalSen: pkg.priceSen, status: "INCLUDED", source: "PACKAGE" },
        });
        // verified component lines (zero price) + packaged parts (for COGS + stock)
        for (const it of pkg.items) {
          if (it.kind === "PART" && it.productId) {
            const prod = await (tx as PrismaClient).product.findUnique({ where: { id: it.productId } });
            await (tx as PrismaClient).serviceJobPart.create({
              data: { jobId, productId: it.productId, quantity: it.defaultQty, unitCostSen: prod?.costPriceSen ?? 0, unitPriceSen: 0, lineTotalSen: 0, status: "INCLUDED", source: "PACKAGE" },
            });
          } else {
            await (tx as PrismaClient).serviceJobItem.create({
              data: { jobId, description: it.name, kind: "SERVICE", quantity: it.defaultQty, unitPriceSen: it.priceSen, lineTotalSen: it.priceSen * it.defaultQty, status: "INCLUDED", source: "PACKAGE" },
            });
          }
        }
        await (tx as PrismaClient).serviceJob.update({ where: { id: jobId }, data: { packageName: pkg.name } });
      }
    }
    for (const a of addons ?? []) {
      await (tx as PrismaClient).serviceJobItem.create({
        data: { jobId, description: a.description, kind: a.kind, quantity: a.quantity, unitPriceSen: a.unitPriceSen, lineTotalSen: a.unitPriceSen * a.quantity, status: "INCLUDED", source: "COUNTER" },
      });
    }
  }

  /** Add a recommended item/part to the job. Returns RECOMMENDED unless accepted. */
  async addRecommendation(input: {
    jobId: string; description: string; kind: string; quantity: number; unitPriceSen: number; source: "COUNTER" | "APPROVAL" | "MANUAL";
    productId?: string; unitCostSen?: number; accept?: boolean;
  }) {
    const status = input.accept ? "ACCEPTED" : "RECOMMENDED";
    if (input.kind.toUpperCase() === "PART" && input.productId) {
      return db.serviceJobPart.create({
        data: {
          jobId: input.jobId, productId: input.productId, quantity: input.quantity,
          unitCostSen: input.unitCostSen ?? 0, unitPriceSen: input.unitPriceSen,
          lineTotalSen: input.unitPriceSen * input.quantity, status, source: input.source,
        },
      });
    }
    return db.serviceJobItem.create({
      data: {
        jobId: input.jobId, description: input.description, kind: input.kind, quantity: input.quantity,
        unitPriceSen: input.unitPriceSen, lineTotalSen: input.unitPriceSen * input.quantity, status, source: input.source,
      },
    });
  }

  async setItemStatus(jobId: string, kind: "item" | "part", itemId: string, status: "INCLUDED" | "RECOMMENDED" | "ACCEPTED" | "DECLINED") {
    if (kind === "item") await db.serviceJobItem.update({ where: { id: itemId }, data: { status } });
    else await db.serviceJobPart.update({ where: { id: itemId }, data: { status } });
    return this.getDetail(jobId);
  }

  /** Status transition with business rules (§21). */
  async transition(id: string, to: JobStatusInput) {
    const job = await this.repo.getById(id);
    if (!job) throw new Error("Job not found");
    if (job.status === "COMPLETED" || job.status === "CANCELLED") throw new Error("Job is already closed");
    if (!this.canTransition(job.status, to)) throw new Error("Illegal transition " + job.status + " to " + to);
    const data: Prisma.ServiceJobUpdateInput = { status: to };
    if (to === "IN_PROGRESS") data.startedAt = job.startedAt ?? new Date();
    if (to === "READY") data.readyAt = new Date();
    return this.repo.update(id, data);
  }

  async assignMechanic(id: string, mechanicId: string | null) {
    return this.repo.update(id, { mechanic: mechanicId ? { connect: { id: mechanicId } } : { disconnect: true } });
  }

  async byCustomer(customerId: string) {
    const rows = (await this.repo.list()).filter((j) => j.customerId === customerId);
    return rows.map((j) => ({ id: j.id, jobNumber: j.jobNumber, status: j.status, mileage: j.mileage, packageName: j.packageName, completedAt: j.completedAt, createdAt: j.createdAt }));
  }
}

export const jobService = new JobService();
