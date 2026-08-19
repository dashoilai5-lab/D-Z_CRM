"use server";

import { revalidatePath } from "next/cache";
import { jobService } from "@/modules/service-jobs/service";
import { bookingService } from "@/modules/bookings/service";
import { completionService } from "@/services/completion";
import { inspectionService } from "@/modules/inspections/service";
import { crmService } from "@/modules/crm/service";
import { inventoryService } from "@/modules/inventory/service";
import { db } from "@/lib/db";

export async function createJob(input: {
  customerId: string; motorcycleId: string; mileage: number; customerRequest?: string;
  packageId?: string; mechanicId?: string;
  addons?: { description: string; kind: string; quantity: number; unitPriceSen: number; productId?: string; unitCostSen?: number }[];
}) {
  const org = await db.organisation.findFirst();
  const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  const job = await jobService.create({
    branchId: branch!.id,
    customerId: input.customerId,
    motorcycleId: input.motorcycleId,
    mileage: input.mileage,
    customerRequest: input.customerRequest,
    packageId: input.packageId,
    mechanicId: input.mechanicId,
    addons: input.addons?.map((a) => ({ description: a.description, kind: a.kind, quantity: a.quantity, unitPriceSen: a.unitPriceSen })),
  });
  // accepted parts from recommendations
  for (const a of input.addons ?? []) {
    if (a.kind === "PART" && a.productId) {
      await db.serviceJobPart.create({
        data: { jobId: job.id, productId: a.productId, quantity: a.quantity, unitCostSen: a.unitCostSen ?? 0, unitPriceSen: a.unitPriceSen, lineTotalSen: a.unitPriceSen * a.quantity, status: "ACCEPTED", source: "COUNTER" },
      });
    }
  }
  revalidatePath("/", "layout");
  return { ok: true, id: job.id, jobNumber: job.jobNumber };
}

export async function transitionJob(id: string, to: "WAITING" | "IN_PROGRESS" | "AWAITING_APPROVAL" | "READY" | "COMPLETED" | "CANCELLED") {
  if (to === "COMPLETED") {
    const result = await completionService.complete(id);
    revalidatePath("/", "layout");
    return { ok: true, result };
  }
  await jobService.transition(id, to);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function assignMechanic(id: string, mechanicId: string | null) {
  await jobService.assignMechanic(id, mechanicId);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bookingAction(id: string, action: "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "CHECKED_IN", extra?: { date?: string; timeSlot?: string; mileage?: number; packageId?: string; mechanicId?: string }) {
  if (action === "CHECKED_IN") {
    const org = await db.organisation.findFirst();
    const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
    const result = await bookingService.checkIn(id, {
      mileage: extra?.mileage ?? 0,
      branchId: branch!.id,
      packageId: extra?.packageId,
      mechanicId: extra?.mechanicId,
    });
    revalidatePath("/", "layout");
    return { ok: true, result };
  }
  await bookingService.transition(id, action, extra ? { date: extra.date ? new Date(extra.date) : undefined, timeSlot: extra.timeSlot } : undefined);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function acceptRecommendation(jobId: string, kind: "item" | "part", id: string) {
  await jobService.setItemStatus(jobId, kind, id, "ACCEPTED");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function declineRecommendation(jobId: string, kind: "item" | "part", id: string) {
  await jobService.setItemStatus(jobId, kind, id, "DECLINED");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function sendReminder(customerId: string, motorcycleId: string, nextServiceMileage: number) {
  const body = "Hi, your motorcycle may be approaching its next scheduled service.\n\nRecommended: " +
    nextServiceMileage.toLocaleString() + " km\n\nWould you like to make a booking?";
  await crmService.sendMessage({ customerId, body });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createPurchaseOrder(input: { supplierId: string; items: { productId: string; quantity: number; unitCostSen: number }[] }) {
  const org = await db.organisation.findFirst();
  const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  await inventoryService.createPurchaseOrder({ branchId: branch!.id, supplierId: input.supplierId, items: input.items });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function receivePurchaseOrder(poId: string) {
  const org = await db.organisation.findFirst();
  const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  const result = await inventoryService.receivePurchaseOrder(poId, branch!.id);
  revalidatePath("/", "layout");
  return { ok: true, receivedAt: result.receivedAt };
}

export async function updateJobDetails(input: {
  jobId: string;
  mileage?: number;
  customerRequest?: string;
  mechanicId?: string | null;
}) {
  const data: Record<string, unknown> = {};
  if (input.mileage !== undefined) data.mileage = input.mileage;
  if (input.customerRequest !== undefined) data.customerRequest = input.customerRequest || null;
  if (input.mechanicId !== undefined) {
    if (input.mechanicId) data.mechanic = { connect: { id: input.mechanicId } };
    else data.mechanic = { disconnect: true };
  }
  await db.serviceJob.update({ where: { id: input.jobId }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Add priced service lines to a job (additional services from the market catalogue). */
export async function addJobServiceItems(input: {
  jobId: string;
  items: { description: string; priceSen: number }[];
}) {
  if (input.items.length === 0) return { ok: true };
  await db.serviceJobItem.createMany({
    data: input.items.map((it) => ({
      jobId: input.jobId,
      description: it.description,
      kind: "SERVICE",
      quantity: 1,
      unitPriceSen: it.priceSen,
      lineTotalSen: it.priceSen,
      status: "INCLUDED",
      source: "COUNTER",
    })),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Remove a job line (item or part) by id. */
export async function removeJobItem(input: { jobId: string; kind: "item" | "part"; itemId: string }) {
  if (input.kind === "item") await db.serviceJobItem.delete({ where: { id: input.itemId } });
  else await db.serviceJobPart.delete({ where: { id: input.itemId } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addAiRecommendation(input: {
  jobId: string; kind: "item" | "part"; description: string; quantity: number; unitPriceSen: number;
  productId?: string; unitCostSen?: number;
}) {
  const r = await jobService.addRecommendation({
    jobId: input.jobId, description: input.description, kind: input.kind, quantity: input.quantity,
    unitPriceSen: input.unitPriceSen, productId: input.productId, unitCostSen: input.unitCostSen,
    source: "COUNTER", accept: true,
  });
  revalidatePath("/", "layout");
  return { ok: true, id: (r as { id: string }).id };
}
