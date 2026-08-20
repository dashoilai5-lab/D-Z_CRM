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

export async function searchLoyaltyCustomers(q: string) {
  const org = await db.organisation.findFirst();
  const customers = await db.customer.findMany({
    where: { organisationId: org!.id, OR: [{ name: { contains: q } }, { phone: { contains: q } }] },
    orderBy: { name: "asc" },
    take: 8,
    select: { id: true, name: true, phone: true, tags: true, loyaltyAccount: { select: { pointsBalance: true, membershipId: true } } },
  });
  return customers;
}

export async function getLoyaltySnapshot(customerId: string) {
  const account = await db.loyaltyAccount.findUnique({
    where: { customerId },
    include: { tier: true, transactions: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  const customer = await db.customer.findUnique({ where: { id: customerId }, select: { name: true, phone: true, email: true } });
  return { customer, account: account ? {
    pointsBalance: account.pointsBalance,
    totalEarned: account.totalEarned,
    totalRedeemed: account.totalRedeemed,
    membershipId: account.membershipId,
    tierName: account.tier?.name ?? null,
    tierBenefits: account.tier?.benefits ?? null,
    memberSince: account.memberSince,
    recent: account.transactions.map((t) => ({ type: t.type, points: t.points, balanceAfter: t.balanceAfter, reason: t.reason, at: t.createdAt })),
  } : null };
}

export async function qualifyReferralAction(referralId: string) {
  const { referralModule } = await import("@/modules/referrals/service");
  await referralModule.qualify(referralId);
  revalidatePath("/", "layout");
  return { ok: true };
}
