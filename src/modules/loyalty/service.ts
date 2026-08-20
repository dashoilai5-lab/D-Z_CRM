// Loyalty module — membership, points ledger, rewards, redemptions (LOY-001..029).
import { db } from "@/lib/db";

export const loyaltyModule = {
  async getOrCreateAccount(organisationId: string, customerId: string) {
    let account = await db.loyaltyAccount.findUnique({ where: { customerId }, include: { tier: true } });
    if (!account) {
      const tier = await db.loyaltyTier.findFirst({ where: { organisationId, minPoints: { lte: 0 } }, orderBy: { minPoints: "asc" } });
      account = await db.loyaltyAccount.create({
        data: {
          organisationId,
          customerId,
          tierId: tier?.id ?? null,
          membershipId: "DZ-M-" + Date.now().toString(36).toUpperCase(),
        },
        include: { tier: true },
      });
    }
    return account;
  },

  async tierFor(organisationId: string, points: number) {
    return db.loyaltyTier.findFirst({ where: { organisationId, active: true, minPoints: { lte: points } }, orderBy: { minPoints: "desc" } });
  },

  /** Earn points (service-based, purchase-based, referral, promo bonus). */
  async earnPoints(input: { organisationId: string; customerId: string; points: number; reason: string; referenceType?: string; referenceId?: string }) {
    if (input.points <= 0) return null;
    const account = await this.getOrCreateAccount(input.organisationId, input.customerId);
    const balance = account.pointsBalance + input.points;
    const tier = await this.tierFor(input.organisationId, account.totalEarned + input.points);
    await db.loyaltyAccount.update({
      where: { id: account.id },
      data: { pointsBalance: balance, totalEarned: { increment: input.points }, tierId: tier?.id ?? account.tierId },
    });
    await db.loyaltyTransaction.create({
      data: { accountId: account.id, type: "EARN", points: input.points, balanceAfter: balance, reason: input.reason, referenceType: input.referenceType, referenceId: input.referenceId },
    });
    return { accountId: account.id, balance };
  },

  /** Redeem a reward (LOY-023/024/028/029): balance guard + single-use dedupe. */
  async redeem(input: { organisationId: string; customerId: string; rewardId: string }) {
    const [account, reward] = await Promise.all([
      this.getOrCreateAccount(input.organisationId, input.customerId),
      db.reward.findUnique({ where: { id: input.rewardId } }),
    ]);
    if (!reward) throw new Error("Reward not found");
    if (!reward.active) throw new Error("Reward is inactive");
    if (account.pointsBalance < reward.pointsRequired) throw new Error("Insufficient points (have " + account.pointsBalance + ", need " + reward.pointsRequired + ")");
    if (reward.singleUse) {
      const used = await db.rewardRedemption.findFirst({ where: { accountId: account.id, rewardId: reward.id, status: "REDEEMED" } });
      if (used) throw new Error("Reward already redeemed");
    }
    const balance = account.pointsBalance - reward.pointsRequired;
    await db.loyaltyAccount.update({ where: { id: account.id }, data: { pointsBalance: balance, totalRedeemed: { increment: reward.pointsRequired } } });
    await db.loyaltyTransaction.create({
      data: { accountId: account.id, type: "REDEEM", points: -reward.pointsRequired, balanceAfter: balance, reason: "Redeemed: " + reward.name, referenceType: "REWARD", referenceId: reward.id },
    });
    const redemption = await db.rewardRedemption.create({
      data: { accountId: account.id, rewardId: reward.id, pointsSpent: reward.pointsRequired, status: "REDEEMED" },
    });
    return { redemption, balance };
  },

  /** Manual adjustment with audit trail (LOY-015/021). */
  async adjustPoints(input: { organisationId: string; customerId: string; delta: number; reason: string }) {
    if (input.delta === 0) return null;
    const account = await this.getOrCreateAccount(input.organisationId, input.customerId);
    const balance = account.pointsBalance + input.delta;
    if (balance < 0) throw new Error("Balance would go negative");
    await db.loyaltyAccount.update({ where: { id: account.id }, data: { pointsBalance: balance } });
    await db.loyaltyTransaction.create({
      data: { accountId: account.id, type: "ADJUST", points: input.delta, balanceAfter: balance, reason: input.reason },
    });
    return { accountId: account.id, balance };
  },

  /** Ledger view for a customer (LOY-022/023). */
  async ledger(customerId: string) {
    const account = await db.loyaltyAccount.findUnique({ where: { customerId }, include: { tier: true, transactions: { orderBy: { createdAt: "desc" }, take: 50 } } });
    return account;
  },

  /** All accounts for the management page. */
  async list(organisationId: string, q?: string) {
    return db.loyaltyAccount.findMany({
      where: { organisationId, ...(q ? { customer: { name: { contains: q } } } : {}) },
      include: { customer: { select: { id: true, name: true, phone: true } }, tier: true, transactions: { orderBy: { createdAt: "desc" }, take: 30 } },
      orderBy: { pointsBalance: "desc" },
      take: 100,
    });
  },
};
