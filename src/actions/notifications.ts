"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function markNotificationRead(id: string) {
  await db.notification.update({ where: { id }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<void> {
  await db.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
}
