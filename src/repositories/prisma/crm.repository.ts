import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike, ICrmRepository } from "@/modules/crm/repository";
import { db } from "@/lib/db";

export class PrismaCrmRepository implements ICrmRepository {
  private c(client?: DbLike): PrismaClient | Prisma.TransactionClient { return client ?? db; }
  listReminders(client?: DbLike) { return this.c(client).serviceReminder.findMany({ include: { customer: true, motorcycle: true }, orderBy: { createdAt: "desc" } }); }
  createReminder(data: Prisma.ServiceReminderCreateInput, client?: DbLike) { return this.c(client).serviceReminder.create({ data }); }
  updateReminder(id: string, data: Prisma.ServiceReminderUpdateInput, client?: DbLike) { return this.c(client).serviceReminder.update({ where: { id }, data }); }
  closeRemindersForMotorcycle(motorcycleId: string, client?: DbLike) {
    return this.c(client).serviceReminder.updateMany({ where: { motorcycleId, closedAt: null }, data: { closedAt: new Date() } });
  }
  listMessages(client?: DbLike) { return this.c(client).message.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 200 }); }
  listMessagesForCustomer(customerId: string, client?: DbLike) { return this.c(client).message.findMany({ where: { customerId }, include: { customer: true }, orderBy: { createdAt: "desc" }, take: 100 }); }
  createMessage(data: Prisma.MessageUncheckedCreateInput, client?: DbLike) { return this.c(client).message.create({ data }); }
  listReviews(client?: DbLike) { return this.c(client).review.findMany({ include: { customer: true, job: true }, orderBy: { createdAt: "desc" }, take: 200 }); }
  createReview(data: Prisma.ReviewCreateInput, client?: DbLike) { return this.c(client).review.create({ data }); }
}
