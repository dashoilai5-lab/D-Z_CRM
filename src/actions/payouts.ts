"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";

export interface PayoutDraft {
  userId: string;
  period: string;
  periodStart: Date;
  baseSen: number;
  commissionSen: number;
  addonBonusSen: number;
  totalSen: number;
}

/** 发起发薪（workshop tick）：创建/更新 StaffPayout → PENDING（待 mechanic 确认收款后才出粮）。 */
export async function settlePayouts(items: PayoutDraft[]) {
  const list = items.filter((i) => i.totalSen > 0);
  if (list.length === 0) return { ok: false as const, error: "Nothing to settle" };
  for (const it of list) {
    const existing = await db.staffPayout.findUnique({
      where: { userId_period_periodStart: { userId: it.userId, period: it.period, periodStart: it.periodStart } },
      include: { payments: { select: { amountSen: true } } },
    });
    const paidSen = existing?.payments.reduce((s, p) => s + p.amountSen, 0) ?? 0;
    if (existing?.status === "PAID" && paidSen >= it.totalSen) continue; // 已出粮
    await db.staffPayout.upsert({
      where: { userId_period_periodStart: { userId: it.userId, period: it.period, periodStart: it.periodStart } },
      create: {
        userId: it.userId, period: it.period, periodStart: it.periodStart,
        baseSen: it.baseSen, commissionSen: it.commissionSen, addonBonusSen: it.addonBonusSen, totalSen: it.totalSen,
        status: "PENDING", // 待 mechanic 确认
      },
      update: { baseSen: it.baseSen, commissionSen: it.commissionSen, addonBonusSen: it.addonBonusSen, totalSen: it.totalSen, status: paidSen >= it.totalSen ? existing?.status ?? "PENDING" : "PENDING" },
    });
  }
  revalidatePath("/workshop/settlements");
  return { ok: true as const, settled: list.length };
}

/** Mechanic 确认收款（出粮）：选 CASH / QR 方式，确认（部分或全额）→ 累计满额自动 PAID。 */
export async function confirmPayout(payoutId: string, amountSen: number, method: string) {
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user || session.role !== "MECHANIC") return { ok: false as const, error: "Mechanic access required" };
  const payout = await db.staffPayout.findUnique({ where: { id: payoutId }, select: { id: true, userId: true, totalSen: true, status: true } });
  if (!payout || payout.userId !== session.user.id) return { ok: false as const, error: "Not your payout" };
  if (payout.status === "PAID") return { ok: false as const, error: "Already paid" };
  if (amountSen <= 0) return { ok: false as const, error: "Invalid amount" };

  await db.staffPayoutPayment.create({ data: { payoutId: payout.id, amountSen, method, paidAt: new Date() } });
  const paid = await db.staffPayoutPayment.aggregate({ where: { payoutId: payout.id }, _sum: { amountSen: true } });
  const paidSen = paid._sum.amountSen ?? 0;
  const status = paidSen >= payout.totalSen ? "PAID" : "PARTIAL";
  await db.staffPayout.update({ where: { id: payout.id }, data: { status, paidAt: status === "PAID" ? new Date() : null } });
  revalidatePath("/workshop/settlements");
  revalidatePath("/mechanic-app/earnings");
  return { ok: true as const };
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
