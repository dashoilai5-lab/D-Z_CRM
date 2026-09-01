"use server";

import { revalidatePath } from "next/cache";
import { marketingService } from "@/modules/marketing/service";
import { messagingProvider } from "@/providers";
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

export async function updateCampaign(input: {
  id: string;
  name?: string;
  type?: "RETURN" | "REMINDER" | "PROMO" | "NEWS";
  status?: "DRAFT" | "SCHEDULED" | "ACTIVE" | "ENDED";
  startDate?: string;
  endDate?: string | null;
  discountPercent?: number | null;
  audience?: string;
}) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.type !== undefined) data.type = input.type;
  if (input.status !== undefined) data.status = input.status;
  if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
  if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
  if (input.discountPercent !== undefined) data.discountPercent = input.discountPercent;
  if (input.audience !== undefined) data.audience = input.audience;
  await db.campaign.update({ where: { id: input.id }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createPoster(input: {
  title: string;
  type?: string;
  month?: string;
  description?: string;
  url?: string;
}) {
  const branchId = await mainBranchId();
  await marketingService.createAsset({
    branchId,
    title: input.title,
    type: input.type ?? "POSTER",
    month: input.month ?? null,
    description: input.description ?? null,
    url: input.url ?? null,
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

export async function publishReview(reviewId: string) {
  await db.review.update({ where: { id: reviewId }, data: { status: "PUBLISHED" } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function replyToReview(reviewId: string, reply: string) {
  await db.review.update({ where: { id: reviewId }, data: { reply, repliedAt: new Date(), status: "PUBLISHED" } });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Resolve the customers a campaign audience maps to. */
async function audienceCustomers(audience: string | null): Promise<{ id: string; name: string; phone: string | null }[]> {
  const all = await db.customer.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, joinedAt: true } });
  if (!audience || audience === "ALL") return all;
  if (audience === "NEW") {
    return all.filter((c) => new Date(c.joinedAt) > new Date(Date.now() - 30 * 86400000));
  }
  // reminder-based audiences: OVERDUE / 30_DAYS / 60_DAYS
  const statuses = audience === "OVERDUE" ? ["DUE", "OVERDUE"] : ["UPCOMING", "DUE_SOON", "DUE", "OVERDUE"];
  const reminded = await db.serviceReminder.findMany({ where: { status: { in: statuses as never } }, select: { customerId: true } });
  const ids = new Set(reminded.map((r) => r.customerId));
  return all.filter((c) => ids.has(c.id));
}

/** One-click WhatsApp broadcast to a campaign's audience. Persists messages linked to the campaign. */
export async function broadcastCampaign(input: { campaignId: string; message?: string }) {
  const campaign = await db.campaign.findUnique({ where: { id: input.campaignId } });
  if (!campaign) throw new Error("Campaign not found");
  const org = await db.organisation.findFirst();
  const branch = await db.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });

  const customers = await audienceCustomers(campaign.audience);
  const body = input.message?.trim() || "Hi, " + campaign.name + " is on now at D&Z Smart Workshop" + (campaign.discountPercent ? " — save " + campaign.discountPercent + "%!" : " — book your service today!");
  let sent = 0;
  for (const c of customers) {
    const result = await messagingProvider.send(c.phone ?? c.name, body);
    await db.message.create({
      data: {
        organisationId: org!.id,
        branchId: branch?.id,
        customerId: c.id,
        direction: "OUT",
        channel: "WHATSAPP",
        body,
        status: result.status,
        externalId: result.externalId ?? null,
        referenceType: "CAMPAIGN",
        referenceId: campaign.id,
      },
    });
    sent++;
  }
  revalidatePath("/", "layout");
  return { ok: true, sent, audience: customers.length };
}
