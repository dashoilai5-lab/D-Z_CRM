"use server";

import { revalidatePath } from "next/cache";
import { bookingService } from "@/modules/bookings/service";
import { inspectionService } from "@/modules/inspections/service";
import { db } from "@/lib/db";
import { fmtKM } from "@/lib/format";

export async function bookService(input: {
  customerId: string; motorcycleId: string; serviceType: string; date: string; timeSlot: string; notes?: string;
}) {
  const org = await db.organisation.findFirst();
  const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  await bookingService.create({
    branchId: branch!.id,
    customerId: input.customerId,
    motorcycleId: input.motorcycleId,
    serviceType: input.serviceType,
    date: new Date(input.date + "T09:00:00"),
    timeSlot: input.timeSlot,
    notes: input.notes,
    source: "RIDER_APP",
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function respondApproval(approvalId: string, decision: "APPROVED" | "DECLINED") {
  const result = await inspectionService.respondApproval(approvalId, decision);
  revalidatePath("/", "layout");
  return { ok: true, ...result };
}

export async function updateProfile(input: { customerId: string; name?: string; phone?: string }) {
  await db.customer.update({ where: { id: input.customerId }, data: { name: input.name, phone: input.phone } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markNotificationsRead(customerId: string, ids?: string[]) {
  if (ids && ids.length > 0) {
    await db.notification.updateMany({ where: { customerId, id: { in: ids } }, data: { readAt: new Date() } });
  } else {
    await db.notification.updateMany({ where: { customerId, readAt: null }, data: { readAt: new Date() } });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function submitReview(input: { customerId: string; branchId: string; jobId?: string; rating: number; comment?: string }) {
  await db.review.create({
    data: {
      branchId: input.branchId,
      customerId: input.customerId,
      jobId: input.jobId,
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      comment: input.comment,
      source: "APP",
      status: "SUBMITTED",
      requestedAt: new Date(),
    },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
