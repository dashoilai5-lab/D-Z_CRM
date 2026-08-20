"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { testRidesModule } from "@/modules/test-rides/service";

export async function updateTestRideStatus(id: string, status: string) {
  await testRidesModule.updateStatus(id, status);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function scheduleTestRide(input: {
  customerName: string; phone?: string; model: string; branchId?: string; rideDate?: string; timeSlot?: string;
  salespersonId?: string; leadId?: string; notes?: string;
}) {
  const org = await db.organisation.findFirst();
  const branch = input.branchId
    ? await db.branch.findFirst({ where: { id: input.branchId, organisationId: org!.id } })
    : await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  const created = await testRidesModule.create({
    organisationId: org!.id,
    branchId: branch!.id,
    leadId: input.leadId || null,
    motorcycleModel: input.model,
    rideDate: input.rideDate ? new Date(input.rideDate + "T00:00:00") : new Date(),
    timeSlot: input.timeSlot || null,
    salespersonId: input.salespersonId || null,
    notes: input.notes || null,
  });
  revalidatePath("/", "layout");
  return { ok: true, id: created.id };
}
