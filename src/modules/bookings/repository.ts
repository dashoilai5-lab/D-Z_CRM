import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike } from "@/modules/customers/repository";

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: { customer: true; motorcycle: true; job: { select: { id: true; jobNumber: true; status: true } } };
}>;

export interface IBookingRepository {
  list(client?: DbLike): Promise<BookingWithRelations[]>;
  getById(id: string, client?: DbLike): Promise<BookingWithRelations | null>;
  create(data: Prisma.BookingCreateInput, client?: DbLike): Promise<BookingWithRelations>;
  update(id: string, data: Prisma.BookingUpdateInput, client?: DbLike): Promise<BookingWithRelations>;
  count(client?: DbLike): Promise<number>;
  countForDate(date: Date, client?: DbLike): Promise<number>;
}

export type { DbLike } from "@/modules/customers/repository";
