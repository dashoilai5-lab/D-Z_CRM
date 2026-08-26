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
      db.payment.updateMany({ where: { invoiceId: id, status: "PENDING" }, data: { status: "PAID", method: "CASH" } }),
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

  await db.payment.create({ data: { invoiceId, amountSen, method: method as never, status: "PAID", paidAt: new Date() } });
  // 累计已收 >= 总额 → 自动结清
  const paid = await db.payment.aggregate({ where: { invoiceId, status: "PAID" }, _sum: { amountSen: true } });
  if ((paid._sum.amountSen ?? 0) >= inv.totalSen) {
    await db.invoice.update({ where: { id: invoiceId }, data: { status: "PAID", paidAt: new Date() } });
  }
  revalidatePath("/workshop/finance/invoices");
  revalidatePath("/rider/invoices");
  return { ok: true as const };
}
