"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { generateDraft, type DraftKind } from "@/modules/ai/draft";
import { crmService } from "@/modules/crm/service";

export async function draftMessage(input: { customerId: string; kind: DraftKind; tone?: string }) {
  const draft = await generateDraft(input);
  return { ok: true, ...draft };
}

export async function sendDraft(input: { customerId: string; body: string; isMarketing?: boolean }) {
  await crmService.sendMessage({ customerId: input.customerId, body: input.body, isMarketing: input.isMarketing });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function searchCustomersForDraft(q: string) {
  const customers = await db.customer.findMany({ where: { OR: [{ name: { contains: q } }, { phone: { contains: q } }] }, take: 8, select: { id: true, name: true, phone: true } });
  return customers;
}
