import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike } from "@/modules/customers/repository";

export interface IMotorcycleRepository {
  getById(id: string, client?: DbLike): Promise<Prisma.MotorcycleGetPayload<{ include: { customer: true } }> | null>;
  listByCustomer(customerId: string, client?: DbLike): Promise<Prisma.MotorcycleGetPayload<{ include: { customer: true } }>[]>;
  listAll(client?: DbLike): Promise<Prisma.MotorcycleGetPayload<{ include: { customer: true; jobs: { orderBy: { createdAt: "desc" } } } }>[]>;
  update(id: string, data: Prisma.MotorcycleUpdateInput, client?: DbLike): Promise<unknown>;
}

export type { DbLike } from "@/modules/customers/repository";
