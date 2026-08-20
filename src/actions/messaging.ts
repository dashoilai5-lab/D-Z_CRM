"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createTemplate(input: { name: string; channel: string; body: string }) {
  const org = await db.organisation.findFirst();
  await db.messageTemplate.create({ data: { organisationId: org!.id, name: input.name, channel: input.channel, body: input.body } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateTemplate(id: string, data: { name?: string; channel?: string; body?: string; active?: boolean }) {
  await db.messageTemplate.update({ where: { id }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createAutomationRule(input: { name: string; trigger: string; actionsJson: string }) {
  const org = await db.organisation.findFirst();
  await db.automationRule.create({ data: { organisationId: org!.id, name: input.name, triggerType: "EVENT", trigger: input.trigger, actions: input.actionsJson } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleAutomation(id: string, active: boolean) {
  await db.automationRule.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
  return { ok: true };
}
