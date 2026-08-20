"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function updateOrganisation(input: { name?: string; contactPhone?: string | null; contactEmail?: string | null; address?: string | null; taxId?: string | null; timezone?: string; currency?: string; lostReasons?: string }) {
  const org = await db.organisation.findFirst();
  if (!org) return { ok: false, error: "No organisation" };
  await db.organisation.update({ where: { id: org.id }, data: { ...input, contactPhone: input.contactPhone ?? null, contactEmail: input.contactEmail ?? null, address: input.address ?? null, taxId: input.taxId ?? null } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateBranch(id: string, input: { name?: string; phone?: string; address?: string; operatingHours?: string }) {
  await db.branch.update({ where: { id }, data: input });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createBranch(input: { name: string; city: string; phone?: string; address?: string }) {
  const org = await db.organisation.findFirst();
  await db.branch.create({ data: { organisationId: org!.id, name: input.name, city: input.city, phone: input.phone ?? null, address: input.address ?? null } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createServiceType(input: { name: string; category?: string; durationMin?: number; priceSen?: number }) {
  const org = await db.organisation.findFirst();
  await db.serviceType.create({ data: { organisationId: org!.id, name: input.name, category: input.category ?? null, durationMin: input.durationMin ?? null, priceSen: input.priceSen ?? null } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleServiceType(id: string, active: boolean) {
  await db.serviceType.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
  return { ok: true };
}
