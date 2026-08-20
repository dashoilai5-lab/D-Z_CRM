"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth/audit";

export async function transferMotorcycle(bikeId: string, newCustomerId: string) {
  const bike = await db.motorcycle.findUnique({ where: { id: bikeId }, include: { customer: true } });
  if (!bike) return { ok: false, error: "Motorcycle not found" };
  const target = await db.customer.findUnique({ where: { id: newCustomerId } });
  if (!target) return { ok: false, error: "Target customer not found" };
  await db.motorcycle.update({ where: { id: bikeId }, data: { customerId: newCustomerId } });
  await audit({
    organisationId: bike.customer.organisationId,
    branchId: null,
    action: "VEHICLE_TRANSFERRED",
    entity: "MOTORCYCLE",
    entityId: bikeId,
    before: { owner: bike.customer.name },
    after: { owner: target.name },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
