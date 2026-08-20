// Referral module — referral codes, tracking, reward qualification (REF-001..009).
import { db } from "@/lib/db";

export const referralModule = {
  /** Get or create a referral code for a customer (REF-001). */
  async codeFor(customerId: string): Promise<string> {
    const existing = await db.referral.findFirst({ where: { referringCustomerId: customerId } });
    if (existing) return existing.code;
    const customer = await db.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error("Customer not found");
    const code = "DZ-" + customer.name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    await db.referral.create({ data: { organisationId: customer.organisationId, referringCustomerId: customer.id, code } });
    return code;
  },

  /** Record a referred prospect/customer (REF-002..004). Prevents self-referral (REF-009). */
  async track(input: { referringCustomerId: string; referredCustomerId?: string; referredLeadId?: string }) {
    if (input.referredCustomerId === input.referringCustomerId) throw new Error("Cannot refer yourself");
    const referrer = await db.customer.findUnique({ where: { id: input.referringCustomerId } });
    if (!referrer) throw new Error("Referrer not found");
    const code = await this.codeFor(referrer.id);
    return db.referral.create({
      data: {
        organisationId: referrer.organisationId,
        referringCustomerId: referrer.id,
        referredCustomerId: input.referredCustomerId ?? null,
        referredLeadId: input.referredLeadId ?? null,
        code,
        status: "PENDING",
      },
    });
  },

  /** Qualify a referral (e.g. referred customer's first paid service) → reward (REF-005..007). */
  async qualify(referralId: string, rewardPoints = 200) {
    const referral = await db.referral.findUnique({ where: { id: referralId } });
    if (!referral) throw new Error("Referral not found");
    if (referral.status === "REWARDED") throw new Error("Already rewarded");
    await db.referral.update({ where: { id: referralId }, data: { status: "REWARDED", rewardStatus: "ISSUED", qualifiedAt: new Date() } });
    const { loyaltyModule } = await import("@/modules/loyalty/service");
    await loyaltyModule.earnPoints({
      organisationId: referral.organisationId,
      customerId: referral.referringCustomerId,
      points: rewardPoints,
      reason: "Referral rewarded",
      referenceType: "REFERRAL",
      referenceId: referralId,
    });
    return referral;
  },

  async list(organisationId: string) {
    return db.referral.findMany({
      where: { organisationId },
      include: { referringCustomer: { select: { id: true, name: true } }, referredCustomer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },
};
