"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { messagingModule } from "@/modules/messaging/service";

/** Send a service reminder via the Service Reminder template (REM-008..020). */
export async function sendReminder(reminderId: string) {
  const reminder = await db.serviceReminder.findUnique({
    where: { id: reminderId },
    include: { customer: true, motorcycle: true, job: true },
  });
  if (!reminder) return { ok: false, error: "Reminder not found" };
  const template = await db.messageTemplate.findFirst({ where: { name: { contains: "Service Reminder" } } });
  if (!template) return { ok: false, error: "Service Reminder template not found — create one in Message Templates" };
  const sent = await messagingModule.sendFromTemplate({
    customerId: reminder.customerId,
    templateId: template.id,
    vars: {
      bike: reminder.motorcycle.brand + " " + reminder.motorcycle.model + " (" + reminder.motorcycle.plate + ")",
      date: reminder.estimatedDate ? reminder.estimatedDate.toISOString().slice(0, 10) : "soon",
      next: reminder.nextServiceMileage.toLocaleString(),
    },
    referenceType: "SERVICE_REMINDER",
  });
  // mark as DUE (reminded) — keep in the list but no longer silent
  await db.serviceReminder.update({
    where: { id: reminderId },
    data: { status: reminder.status === "UPCOMING" ? "DUE_SOON" : reminder.status },
  });
  revalidatePath("/", "layout");
  return { ok: true, sent: sent.sent };
}
