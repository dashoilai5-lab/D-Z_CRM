"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { inventoryService } from "@/modules/inventory/service";

export async function adjustStock(input: { branchId: string; productId: string; delta: number; reason: string }) {
  if (input.delta > 0) await inventoryService.addStock(input.branchId, input.productId, input.delta, input.reason || "Stock adjustment");
  else await inventoryService.deductStock(input.branchId, input.productId, -input.delta, input.reason || "Stock adjustment");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function transferStock(input: { fromBranchId: string; toBranchId: string; productId: string; qty: number }) {
  await inventoryService.transferStock(input.fromBranchId, input.toBranchId, input.productId, input.qty);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function getBranches() {
  const org = await db.organisation.findFirst();
  return db.branch.findMany({ where: { organisationId: org!.id }, select: { id: true, name: true, city: true } });
}
