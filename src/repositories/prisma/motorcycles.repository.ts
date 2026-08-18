import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike, IMotorcycleRepository } from "@/modules/motorcycles/repository";
import { db } from "@/lib/db";

const withCustomer = { customer: true } satisfies Prisma.MotorcycleInclude;
const withJobs = { customer: true, jobs: { orderBy: { createdAt: "desc" as const } } } satisfies Prisma.MotorcycleInclude;

export class PrismaMotorcycleRepository implements IMotorcycleRepository {
  private c(client?: DbLike): PrismaClient | Prisma.TransactionClient { return client ?? db; }
  getById(id: string, client?: DbLike) { return this.c(client).motorcycle.findUnique({ where: { id }, include: withCustomer }); }
  listByCustomer(customerId: string, client?: DbLike) { return this.c(client).motorcycle.findMany({ where: { customerId }, include: withCustomer, orderBy: { createdAt: "asc" } }); }
  listAll(client?: DbLike) { return this.c(client).motorcycle.findMany({ include: withJobs, orderBy: { createdAt: "asc" } }); }
  update(id: string, data: Prisma.MotorcycleUpdateInput, client?: DbLike) { return this.c(client).motorcycle.update({ where: { id }, data }); }
}
