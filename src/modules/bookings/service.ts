import type { IBookingRepository } from "./repository";
import { PrismaBookingRepository } from "@/repositories/prisma/bookings.repository";
import type { BookingSource, BookingStatus, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { jobService } from "@/modules/service-jobs/service";
import type { DbLike } from "@/modules/customers/repository";

export type BookingStatusInput = BookingStatus;

export class BookingService {
  constructor(private repo: IBookingRepository = new PrismaBookingRepository()) {}

  async list() {
    const rows = await this.repo.list();
    return rows.map((b) => ({
      id: b.id, status: b.status, source: b.source, serviceType: b.serviceType,
      date: b.date, timeSlot: b.timeSlot, notes: b.notes,
      customer: { id: b.customer.id, name: b.customer.name, phone: b.customer.phone },
      motorcycle: { brand: b.motorcycle.brand, model: b.motorcycle.model, plate: b.motorcycle.plate },
      job: b.job ? { id: b.job.id, jobNumber: b.job.jobNumber, status: b.job.status } : null,
    }));
  }

  async getById(id: string) {
    const b = await this.repo.getById(id);
    if (!b) return null;
    return {
      id: b.id, status: b.status, source: b.source, serviceType: b.serviceType,
      date: b.date, timeSlot: b.timeSlot, notes: b.notes,
      customer: { id: b.customer.id, name: b.customer.name, phone: b.customer.phone },
      motorcycle: { id: b.motorcycle.id, brand: b.motorcycle.brand, model: b.motorcycle.model, plate: b.motorcycle.plate, year: b.motorcycle.year },
      job: b.job,
    };
  }

  /** Create a booking (rider app or counter). */
  async create(input: {
    branchId: string; customerId: string; motorcycleId: string;
    serviceType: string; date: Date; timeSlot: string; notes?: string; source: BookingSource; campaignId?: string;
  }) {
    return this.repo.create({
      branch: { connect: { id: input.branchId } },
      customer: { connect: { id: input.customerId } },
      motorcycle: { connect: { id: input.motorcycleId } },
      serviceType: input.serviceType,
      date: input.date,
      timeSlot: input.timeSlot,
      notes: input.notes,
      source: input.source,
      campaign: input.campaignId ? { connect: { id: input.campaignId } } : undefined,
    });
  }

  /** Workshop booking actions (§20): confirm / reschedule / cancel / check in. */
  async transition(id: string, status: BookingStatusInput, extra?: { date?: Date; timeSlot?: string }) {
    const data: Record<string, unknown> = { status };
    if (extra?.date) data.date = extra.date;
    if (extra?.timeSlot) data.timeSlot = extra.timeSlot;
    return this.repo.update(id, data as never);
  }

  async stats() {
    const rows = await this.repo.list();
    return {
      requested: rows.filter((r) => r.status === "REQUESTED").length,
      confirmed: rows.filter((r) => r.status === "CONFIRMED").length,
      today: rows.filter((r) => {
        const d = new Date(r.date);
        const n = new Date();
        return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
      }).length,
    };
  }

  /** Check in a booking and create the associated service job (shared workflow). */
  async checkIn(bookingId: string, opts: { mileage: number; branchId: string; packageId?: string; mechanicId?: string; customerRequest?: string }): Promise<{ bookingId: string; jobId: string; jobNumber: string } | null> {
    const booking = await this.repo.getById(bookingId);
    if (!booking || booking.status === "CANCELLED" || booking.status === "COMPLETED") return null;
    if (booking.jobId) {
      await this.repo.update(bookingId, { status: "CHECKED_IN" } as never);
      return { bookingId, jobId: booking.jobId, jobNumber: booking.job?.jobNumber ?? "—" };
    }
    return db.$transaction(async (tx: DbLike) => {
      const lastJob = await (tx as PrismaClient).serviceJob.findFirst({ orderBy: { jobNumber: "desc" } });
      const base = lastJob ? parseInt(lastJob.jobNumber.replace(/\D/g, ""), 10) : 1023;
      const jobNumber = "DZ" + (isNaN(base) ? 1024 : base + 1);
      const job = await (tx as PrismaClient).serviceJob.create({
        data: {
          jobNumber,
          branchId: opts.branchId,
          customerId: booking.customerId,
          motorcycleId: booking.motorcycleId,
          booking: { connect: { id: booking.id } },
          mileage: opts.mileage,
          customerRequest: opts.customerRequest ?? booking.notes ?? undefined,
          servicePackageId: opts.packageId || undefined,
          mechanicId: opts.mechanicId || undefined,
          status: "WAITING",
        },
      });
      await jobService.attachPackage(job.id, opts.packageId, undefined, tx);
      await this.repo.update(bookingId, { status: "CHECKED_IN" } as never, tx);
      return { bookingId, jobId: job.id, jobNumber };
    });
  }
}

export const bookingService = new BookingService();
