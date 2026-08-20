"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function generateSlots(input: { branchId: string; days: number; times: string[]; maxBookings: number }) {
  const branch = await db.branch.findUnique({ where: { id: input.branchId } });
  if (!branch) return { ok: false, error: "Branch not found" };
  let created = 0;
  for (let d = 0; d < input.days; d++) {
    const date = new Date(Date.now() + d * 86400000);
    date.setHours(0, 0, 0, 0);
    for (const t of input.times) {
      const exists = await db.appointmentSlot.findUnique({
        where: { branchId_date_startTime: { branchId: input.branchId, date, startTime: t } },
      });
      if (!exists) {
        await db.appointmentSlot.create({ data: { branchId: input.branchId, date, startTime: t, maxBookings: input.maxBookings } });
        created++;
      }
    }
  }
  revalidatePath("/", "layout");
  return { ok: true, created };
}

export async function updateSlot(id: string, data: { maxBookings?: number; isHoliday?: boolean }) {
  await db.appointmentSlot.update({ where: { id }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteSlot(id: string) {
  await db.appointmentSlot.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}
