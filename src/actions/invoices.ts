"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

/** 批量结清发票：ISSUED → PAID，应收 payment → PAID。 */
export async function settleInvoices(ids: string[]) {
  const list = ids.filter(Boolean);
  if (list.length === 0) return { ok: false as const, error: "No invoices selected" };
  for (const id of list) {
    const inv = await db.invoice.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!inv || inv.status === "PAID") continue;
    await db.$transaction([
      // 结清应收（含 PAY_LATER/PENDING），保留原 method（PAY_LATER 不计入「已收」口径，避免重复计收）
      db.payment.updateMany({ where: { invoiceId: id, status: "PENDING" }, data: { status: "PAID" } }),
      db.invoice.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } }),
    ]);
  }
  revalidatePath("/workshop/finance/invoices");
  revalidatePath("/rider/invoices");
  return { ok: true as const, settled: list.length };
}

/** Split payment：为发票添加一笔收款（部分/全额）；累计满额自动 PAID。 */
export async function addInvoicePayment(invoiceId: string, amountSen: number, method: string) {
  const inv = await db.invoice.findUnique({ where: { id: invoiceId }, select: { id: true, status: true, totalSen: true } });
  if (!inv || inv.status === "PAID") return { ok: false as const, error: "Invoice not found or already paid" };
  if (amountSen <= 0) return { ok: false as const, error: "Invalid amount" };

  // 录入真实收款（PAID）
  await db.payment.create({ data: { invoiceId, amountSen, method: method as never, status: "PAID", paidAt: new Date() } });
  // 累计已收(不计 PAY_LATER 应收占位) >= 总额 → 自动结清，并把完成时自动生成的 PAY_LATER/PENDING 应收一并关闭(标记 PAID)
  const paid = await db.payment.aggregate({ where: { invoiceId, status: "PAID", method: { not: "PAY_LATER" } }, _sum: { amountSen: true } });
  if ((paid._sum.amountSen ?? 0) >= inv.totalSen) {
    await db.$transaction([
      db.invoice.update({ where: { id: invoiceId }, data: { status: "PAID", paidAt: new Date() } }),
      db.payment.updateMany({ where: { invoiceId, method: "PAY_LATER", status: "PENDING" }, data: { status: "PAID" } }),
    ]);
  }
  revalidatePath("/workshop/finance/invoices");
  revalidatePath("/rider/invoices");
  return { ok: true as const };
}
