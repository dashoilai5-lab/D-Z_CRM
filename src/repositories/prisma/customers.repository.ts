import type { Prisma, PrismaClient } from "@prisma/client";
import type { Customer } from "@prisma/client";
import type { DbLike, ICustomerRepository } from "@/modules/customers/repository";
import { db } from "@/lib/db";

const withRelations = {
  motorcycles: { orderBy: { createdAt: "asc" as const } },
  jobs: { include: { invoice: true, mechanic: true, items: true, parts: { include: { product: true } } } },
  messages: { orderBy: { createdAt: "desc" as const } },
  reminders: true,
  reviews: true,
} satisfies Prisma.CustomerInclude;
const withList = {
  motorcycles: true,
  jobs: { include: { invoice: true } },
  messages: true,
  reminders: true,
} satisfies Prisma.CustomerInclude;

export class PrismaCustomerRepository implements ICustomerRepository {
  private c(client?: DbLike): PrismaClient | Prisma.TransactionClient {
    return client ?? db;
  }

  list(client?: DbLike) {
    return this.c(client).customer.findMany({ orderBy: { name: "asc" } });
  }

  listWith(client?: DbLike) {
    return this.c(client).customer.findMany({ orderBy: { name: "asc" }, include: withList });
  }

  getById(id: string, client?: DbLike) {
    return this.c(client).customer.findUnique({
      where: { id },
      include: withRelations,
    });
  }

  getByPhone(phone: string, client?: DbLike) {
    return this.c(client).customer.findFirst({ where: { phone } });
  }

  search(q: string, client?: DbLike) {
    const contains = q.trim().toLowerCase();
    if (!contains) return this.c(client).customer.findMany({ orderBy: { name: "asc" }, include: { motorcycles: true }, take: 20 });
    return this.c(client).customer.findMany({
      where: {
        OR: [
          { name: { contains } },
          { phone: { contains } },
          { motorcycles: { some: { OR: [{ plate: { contains } }, { model: { contains } }, { brand: { contains } }] } } },
        ],
      },
      include: { motorcycles: true },
      orderBy: { name: "asc" },
      take: 20,
    });
  }

  create(data: Prisma.CustomerCreateInput, client?: DbLike) {
    return this.c(client).customer.create({ data });
  }

  update(id: string, data: Prisma.CustomerUpdateInput, client?: DbLike) {
    return this.c(client).customer.update({ where: { id }, data });
  }

  count(client?: DbLike) {
    return this.c(client).customer.count();
  }
}
