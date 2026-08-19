"use server";

import { revalidatePath } from "next/cache";
import { marketingService } from "@/modules/marketing/service";
import { db } from "@/lib/db";

async function mainBranchId() {
  const org = await db.organisation.findFirst();
  const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  return branch!.id;
}

export async function createCampaign(input: {
  name: string;
  type: "RETURN" | "REMINDER" | "PROMO" | "NEWS";
  audience?: string;
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "ENDED";
  startDate: string;
  endDate?: string;
  discountPercent?: number;
}) {
  const branchId = await mainBranchId();
  await marketingService.createCampaign({
    branchId,
    name: input.name,
    type: input.type,
    audience: input.audience,
    status: input.status,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : null,
    discountPercent: input.discountPercent ?? null,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createPoster(input: {
  title: string;
  type?: string;
  month?: string;
  description?: string;
}) {
  const branchId = await mainBranchId();
  await marketingService.createAsset({
    branchId,
    title: input.title,
    type: input.type ?? "POSTER",
    month: input.month ?? null,
    description: input.description ?? null,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createScript(input: {
  title: string;
  platform?: string;
  hook?: string;
  body: string;
  tone?: string;
}) {
  const branchId = await mainBranchId();
  await marketingService.createScript({
    branchId,
    title: input.title,
    platform: input.platform ?? "TIKTOK",
    hook: input.hook ?? null,
    body: input.body,
    tone: input.tone ?? null,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
