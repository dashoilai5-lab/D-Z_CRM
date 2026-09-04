"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";

/** Editing templates is for management staff; mechanics run checklists, not manage the library. */
async function requireEditor() {
  const s = await getSessionUser();
  if (!s.authenticated || s.kind !== "staff") return null;
  if (s.role === "MECHANIC") return null;
  return s;
}

export type MutResult = { ok: boolean; id?: string; error?: string };

export async function createChecklistTemplate(input: { name: string }): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  const name = input?.name?.trim();
  if (!name) return { ok: false, error: "name_required" };
  const created = await db.checklistTemplate.create({ data: { name } });
  revalidatePath("/", "layout");
  return { ok: true, id: created.id };
}

export async function updateChecklistTemplate(id: string, input: { name?: string; isDefault?: boolean }): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  const data: { name?: string; isDefault?: boolean } = {};
  if (typeof input?.name === "string") data.name = input.name.trim() || undefined;
  if (typeof input?.isDefault === "boolean") data.isDefault = input.isDefault;
  if (input?.isDefault) await db.checklistTemplate.updateMany({ data: { isDefault: false } });
  await db.checklistTemplate.update({ where: { id }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteChecklistTemplate(id: string): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  const count = await db.checklistTemplate.count();
  if (count <= 1) return { ok: false, error: "last_template" };
  await db.checklistTemplate.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setDefaultChecklistTemplate(id: string): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  await db.checklistTemplate.updateMany({ data: { isDefault: false } });
  await db.checklistTemplate.update({ where: { id }, data: { isDefault: true } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addChecklistItem(templateId: string, input: { name: string; category?: string; order?: number }): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  const name = input?.name?.trim();
  if (!name) return { ok: false, error: "name_required" };
  const last = await db.checklistItem.findFirst({ where: { templateId }, orderBy: { order: "desc" } });
  const order = input?.order ?? (last?.order ?? 0) + 1;
  const created = await db.checklistItem.create({ data: { templateId, name, category: input?.category || null, order } });
  revalidatePath("/", "layout");
  return { ok: true, id: created.id };
}

export async function updateChecklistItem(id: string, input: { name?: string; category?: string; order?: number }): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  const data: { name?: string; category?: string | null; order?: number } = {};
  if (typeof input?.name === "string") data.name = input.name.trim();
  if (typeof input?.category === "string") data.category = input.category.trim() || null;
  if (typeof input?.order === "number") data.order = input.order;
  await db.checklistItem.update({ where: { id }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteChecklistItem(id: string): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  await db.checklistItem.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Reorder a template's items: orderedIds is the full list of item ids in new order. */
export async function reorderChecklistItems(templateId: string, orderedIds: string[]): Promise<MutResult> {
  const s = await requireEditor();
  if (!s) return { ok: false, error: "unauthorized" };
  await db.$transaction(
    orderedIds.map((id, i) => db.checklistItem.update({ where: { id }, data: { order: i + 1 } }))
  );
  revalidatePath("/", "layout");
  return { ok: true };
}
