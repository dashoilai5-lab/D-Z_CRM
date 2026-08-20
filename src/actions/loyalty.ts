"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { loyaltyModule } from "@/modules/loyalty/service";

export async function earnPointsAction(input: { customerId: string; points: number; reason: string }) {
  const org = await db.organisation.findFirst();
  await loyaltyModule.earnPoints({ organisationId: org!.id, customerId: input.customerId, points: input.points, reason: input.reason });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function adjustPointsAction(input: { customerId: string; delta: number; reason: string }) {
  const org = await db.organisation.findFirst();
  await loyaltyModule.adjustPoints({ organisationId: org!.id, customerId: input.customerId, delta: input.delta, reason: input.reason });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function redeemRewardAction(input: { customerId: string; rewardId: string }) {
  const org = await db.organisation.findFirst();
  const result = await loyaltyModule.redeem({ organisationId: org!.id, customerId: input.customerId, rewardId: input.rewardId });
  revalidatePath("/", "layout");
  return { ok: true, balance: result.balance };
}

export async function qualifyReferralAction(referralId: string) {
  const { referralModule } = await import("@/modules/referrals/service");
  await referralModule.qualify(referralId);
  revalidatePath("/", "layout");
  return { ok: true };
}
