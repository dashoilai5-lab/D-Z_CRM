import type { DbLike } from "@/modules/customers/repository";
import type { ReminderStatus } from "@prisma/client";
import type { ICrmRepository } from "./repository";
import { PrismaCrmRepository } from "@/repositories/prisma/crm.repository";
import { messagingProvider } from "@/providers";
import { db } from "@/lib/db";
import { DEFAULT_SERVICE_INTERVAL_KM } from "@/lib/constants";

/** CRM: service reminders (§29), return list (§30), messages, reviews. */
export class CrmService {
  constructor(private repo: ICrmRepository = new PrismaCrmRepository()) {}

  /** Deterministic reminder status from mileage gap (§29). */
  private statusOf(reminder: { nextServiceMileage: number; status: ReminderStatus }, currentMileage: number): ReminderStatus {
    if (reminder.status === "BOOKED" || reminder.status === "COMPLETED") return reminder.status;
    const gap = reminder.nextServiceMileage - currentMileage;
    if (gap <= 0) return "OVERDUE";
    if (gap <= DEFAULT_SERVICE_INTERVAL_KM * 0.2) return "DUE";
    if (gap <= DEFAULT_SERVICE_INTERVAL_KM * 0.5) return "DUE_SOON";
    return "UPCOMING";
  }

  async reminders() {
    const rows = await this.repo.listReminders();
    const now = new Date();
    const byMileage = new Map<string, number>();
    for (const r of rows) byMileage.set(r.motorcycleId, r.motorcycle.currentMileage);
    return rows
      .map((r) => {
        const status = this.statusOf(r, byMileage.get(r.motorcycleId) ?? 0);
        const gap = r.nextServiceMileage - (byMileage.get(r.motorcycleId) ?? 0);
        const daysLeft = r.estimatedDate ? Math.ceil((r.estimatedDate.getTime() - now.getTime()) / 86400000) : null;
        return {
          id: r.id, status, lastServiceMileage: r.lastServiceMileage, intervalKm: r.intervalKm,
          nextServiceMileage: r.nextServiceMileage, estimatedDate: r.estimatedDate, createdAt: r.createdAt, closedAt: r.closedAt,
          kmGap: gap, daysLeft,
          customer: { id: r.customer.id, name: r.customer.name, phone: r.customer.phone },
          motorcycle: { id: r.motorcycle.id, brand: r.motorcycle.brand, model: r.motorcycle.model, plate: r.motorcycle.plate },
        };
      })
      .filter((r) => !r.closedAt)
      .sort((a, b) => a.kmGap - b.kmGap);
  }

  async customersDueCount(): Promise<number> {
    const rows = await this.reminders();
    return rows.filter((r) => r.status === "DUE" || r.status === "OVERDUE").length;
  }

  /** Customer return list segments (§30). */
  async returnList() {
    const dbc = db;
    const customers = await dbc.customer.findMany({
      include: {
        motorcycles: true,
        jobs: { where: { status: "COMPLETED" }, include: { invoice: true }, orderBy: { completedAt: "desc" } },
        reminders: true,
      },
    });
    const now = Date.now();
    return customers
      .map((c) => {
        const completed = c.jobs;
        const last = completed[0] ?? null;
        const daysSinceVisit = last ? Math.floor((now - (last.completedAt ?? last.createdAt).getTime()) / 86400000) : null;
        const spend = completed.reduce((s, j) => s + (j.invoice?.totalSen ?? 0), 0);
        const bike = [...c.motorcycles].sort((a, b) => b.currentMileage - a.currentMileage)[0] ?? null;
        const due = c.reminders.filter((r) => !r.closedAt).sort((a, b) => a.nextServiceMileage - b.nextServiceMileage)[0];
        let segment: string;
        if (daysSinceVisit === null) segment = "NEVER_VISITED";
        else if (daysSinceVisit >= 120) segment = "LOST_CUSTOMER";
        else if (daysSinceVisit >= 90) segment = "90_PLUS";
        else if (daysSinceVisit >= 60) segment = "60_PLUS";
        else if (daysSinceVisit >= 30) segment = "30_PLUS";
        else segment = "ACTIVE";
        const gap = due && bike ? due.nextServiceMileage - bike.currentMileage : null;
        return {
          customerId: c.id, name: c.name, phone: c.phone, segment, daysSinceVisit, lifetimeValueSen: spend,
          lastService: last ? last.completedAt ?? last.createdAt : null, lastJobNumber: last?.jobNumber ?? null,
          motorcycle: bike ? { brand: bike.brand, model: bike.model, plate: bike.plate } : null,
          recommendedAction:
            segment === "LOST_CUSTOMER" ? "Personal call + special offer" :
            segment === "90_PLUS" ? "WhatsApp return campaign" :
            segment === "60_PLUS" ? "Send service reminder" :
            segment === "30_PLUS" ? "Light-touch check-in" : "No action",
          dueKmGap: gap,
        };
      })
      .filter((c) => c.segment !== "ACTIVE" && c.segment !== "NEVER_VISITED")
      .sort((a, b) => (b.daysSinceVisit ?? 0) - (a.daysSinceVisit ?? 0));
  }

  /** Send a WhatsApp-style message via the mock provider and persist to history (§31). */
  async sendMessage(input: { customerId: string; body: string; channel?: "WHATSAPP" | "SMS" | "APP" | "SYSTEM"; jobId?: string }) {
    const customer = await db.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw new Error("Customer not found");
    const result = await messagingProvider.send(customer.phone ?? customer.name, input.body);
    const message = await this.repo.createMessage({
      customerId: input.customerId,
      organisationId: (await db.organisation.findFirst())!.id,
      branchId: null as never,
      direction: "OUT",
      channel: input.channel ?? "WHATSAPP",
      body: input.body,
      status: result.status,
      jobId: input.jobId,
      referenceType: "REMINDER",
    });
    return message;
  }

  async messagesForCustomer(customerId: string) {
    const rows = await this.repo.listMessagesForCustomer(customerId);
    return rows.map((m) => ({ id: m.id, direction: m.direction, channel: m.channel, body: m.body, status: m.status, createdAt: m.createdAt, jobId: m.jobId }));
  }

  async reviews() {
    const rows = await this.repo.listReviews();
    const rated = rows.filter((r) => r.rating != null);
    const avg = rated.length ? rated.reduce((s, r) => s + r.rating!, 0) / rated.length : 0;
    return {
      avg,
      count: rows.length,
      list: rows.map((r) => ({
        id: r.id, rating: r.rating, comment: r.comment, status: r.status, source: r.source, createdAt: r.createdAt,
        customer: r.customer.name, jobNumber: r.job?.jobNumber ?? null,
      })),
    };
  }
}

export const crmService = new CrmService();
