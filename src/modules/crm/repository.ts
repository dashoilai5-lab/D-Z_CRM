import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike } from "@/modules/customers/repository";

export type ReminderRow = Prisma.ServiceReminderGetPayload<{ include: { customer: true; motorcycle: true } }>;

export interface ICrmRepository {
  listReminders(client?: DbLike): Promise<ReminderRow[]>;
  createReminder(data: Prisma.ServiceReminderCreateInput, client?: DbLike): Promise<unknown>;
  updateReminder(id: string, data: Prisma.ServiceReminderUpdateInput, client?: DbLike): Promise<unknown>;
  closeRemindersForMotorcycle(motorcycleId: string, client?: DbLike): Promise<unknown>;
  listMessages(client?: DbLike): Promise<Prisma.MessageGetPayload<{ include: { customer: true } }>[]>;
  listMessagesForCustomer(customerId: string, client?: DbLike): Promise<Prisma.MessageGetPayload<{ include: { customer: true } }>[]>;
  createMessage(data: Prisma.MessageUncheckedCreateInput, client?: DbLike): Promise<unknown>;
  listReviews(client?: DbLike): Promise<Prisma.ReviewGetPayload<{ include: { customer: true; job: true } }>[]>;
  createReview(data: Prisma.ReviewCreateInput, client?: DbLike): Promise<unknown>;
}

export type { DbLike } from "@/modules/customers/repository";
