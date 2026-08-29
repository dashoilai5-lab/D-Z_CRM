"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

/** Mark all of a mechanic's notifications as read (mechanic app alerts feed). */
export async function markMechanicNotificationsRead(userId: string) {
  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
