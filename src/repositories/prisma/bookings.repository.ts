import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike, IBookingRepository, BookingWithRelations } from "@/modules/bookings/repository";
import { db } from "@/lib/db";

const include = {
  customer: true,
  motorcycle: true,
  job: { select: { id: true, jobNumber: true, status: true } },
} satisfies Prisma.BookingInclude;

export class PrismaBookingRepository implements IBookingRepository {
  private c(client?: DbLike): PrismaClient | Prisma.TransactionClient { return client ?? db; }
  list(client?: DbLike) { return this.c(client).booking.findMany({ include, orderBy: { date: "asc" } }); }
  getById(id: string, client?: DbLike) { return this.c(client).booking.findUnique({ where: { id }, include }); }
  create(data: Prisma.BookingCreateInput, client?: DbLike) { return this.c(client).booking.create({ data, include }); }
  update(id: string, data: Prisma.BookingUpdateInput, client?: DbLike) { return this.c(client).booking.update({ where: { id }, data, include }); }
  count(client?: DbLike) { return this.c(client).booking.count(); }
  countForDate(date: Date, client?: DbLike) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    return this.c(client).booking.count({ where: { date: { gte: start, lte: end } } });
  }
}
