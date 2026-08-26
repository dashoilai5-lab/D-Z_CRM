"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export interface PayoutDraft {
  userId: string;
  period: string;
  periodStart: Date;
  baseSen: number;
  commissionSen: number;
  addonBonusSen: number;
  totalSen: number;
}

/** 批量发薪（tick 结清）：为每个 foreman 创建/更新 StaffPayout → PAID + 全额 payment。 */
export async function settlePayouts(items: PayoutDraft[]) {
  const list = items.filter((i) => i.totalSen > 0);
  if (list.length === 0) return { ok: false as const, error: "Nothing to settle" };
  for (const it of list) {
    const payout = await db.staffPayout.upsert({
      where: { userId_period_periodStart: { userId: it.userId, period: it.period, periodStart: it.periodStart } },
      create: {
        userId: it.userId, period: it.period, periodStart: it.periodStart,
        baseSen: it.baseSen, commissionSen: it.commissionSen, addonBonusSen: it.addonBonusSen, totalSen: it.totalSen,
        status: "PAID", paidAt: new Date(),
        payments: { create: { amountSen: it.totalSen, method: "CASH", paidAt: new Date() } },
      },
      update: { baseSen: it.baseSen, commissionSen: it.commissionSen, addonBonusSen: it.addonBonusSen, totalSen: it.totalSen, status: "PAID", paidAt: new Date() },
    });
    const paidSum = await db.staffPayoutPayment.aggregate({ where: { payoutId: payout.id }, _sum: { amountSen: true } });
    if ((paidSum._sum.amountSen ?? 0) < it.totalSen) {
      await db.staffPayoutPayment.create({ data: { payoutId: payout.id, amountSen: it.totalSen - (paidSum._sum.amountSen ?? 0), method: "CASH", paidAt: new Date() } });
    }
  }
  revalidatePath("/workshop/settlements");
  return { ok: true as const, settled: list.length };
}

/** Split 分期发薪：为某 foreman 的周期薪资加一笔支付；累计满额自动 PAID。 */
export async function addPayoutPayment(input: { userId: string; period: string; periodStart: Date; baseSen: number; commissionSen: number; addonBonusSen: number; totalSen: number; amountSen: number; method: string }) {
  if (input.amountSen <= 0) return { ok: false as const, error: "Invalid amount" };
  const payout = await db.staffPayout.upsert({
    where: { userId_period_periodStart: { userId: input.userId, period: input.period, periodStart: input.periodStart } },
    create: {
      userId: input.userId, period: input.period, periodStart: input.periodStart,
      baseSen: input.baseSen, commissionSen: input.commissionSen, addonBonusSen: input.addonBonusSen, totalSen: input.totalSen,
      status: "PARTIAL", payments: { create: { amountSen: input.amountSen, method: input.method, paidAt: new Date() } },
    },
    update: { baseSen: input.baseSen, commissionSen: input.commissionSen, addonBonusSen: input.addonBonusSen, totalSen: input.totalSen },
  });
  if (payout.status === "UNPAID" || payout.status === "PARTIAL") {
    await db.staffPayoutPayment.create({ data: { payoutId: payout.id, amountSen: input.amountSen, method: input.method, paidAt: new Date() } });
  }
  const paid = await db.staffPayoutPayment.aggregate({ where: { payoutId: payout.id }, _sum: { amountSen: true } });
  const status = (paid._sum.amountSen ?? 0) >= input.totalSen ? "PAID" : "PARTIAL";
  await db.staffPayout.update({ where: { id: payout.id }, data: { status, paidAt: status === "PAID" ? new Date() : null } });
  revalidatePath("/workshop/settlements");
  return { ok: true as const };
}
