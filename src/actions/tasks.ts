"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasksModule } from "@/modules/tasks/service";
import { getCurrentUser } from "@/lib/auth/session";

export async function createTask(input: {
  title: string; description?: string; ownerId?: string; relatedType?: string; relatedId?: string;
  dueAt?: string; priority?: string; branchId?: string;
}) {
  const org = await db.organisation.findFirst();
  const task = await tasksModule.create({
    organisationId: org!.id,
    branchId: input.branchId ?? null,
    ownerId: input.ownerId || null,
    title: input.title,
    description: input.description || null,
    relatedType: input.relatedType || null,
    relatedId: input.relatedId || null,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
    priority: input.priority || "NORMAL",
  });
  revalidatePath("/", "layout");
  return { ok: true, id: task.id };
}

export async function completeTask(id: string) {
  const user = await getCurrentUser();
  const me = user ?? (await db.user.findFirst());
  await tasksModule.complete(id, me!.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function reopenTask(id: string) {
  await tasksModule.reopen(id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function cancelTask(id: string) {
  await tasksModule.cancel(id);
  revalidatePath("/", "layout");
  return { ok: true };
}
