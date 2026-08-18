import type { Prisma, PrismaClient } from "@prisma/client";
import type { Customer } from "@prisma/client";

export type DbLike = PrismaClient | Prisma.TransactionClient;

/** CustomerRepository — data access boundary (UI → Service → Repository → DB). */
export interface ICustomerRepository {
  list(client?: DbLike): Promise<Customer[]>;
  listWith(client?: DbLike): Promise<Prisma.CustomerGetPayload<{ include: { motorcycles: true; jobs: { include: { invoice: true } }; messages: true; reminders: true } }>[]>;
  getById(id: string, client?: DbLike): Promise<Prisma.CustomerGetPayload<{ include: { motorcycles: { orderBy: { createdAt: "asc" } }; jobs: { include: { invoice: true; mechanic: true; items: true; parts: { include: { product: true } } } }; messages: { orderBy: { createdAt: "desc" } }; reminders: true; reviews: true } }> | null>;
  getByPhone(phone: string, client?: DbLike): Promise<Customer | null>;
  search(q: string, client?: DbLike): Promise<Prisma.CustomerGetPayload<{ include: { motorcycles: true } }>[]>;
  create(data: Prisma.CustomerCreateInput, client?: DbLike): Promise<Customer>;
  update(id: string, data: Prisma.CustomerUpdateInput, client?: DbLike): Promise<Customer>;
  count(client?: DbLike): Promise<number>;
}
