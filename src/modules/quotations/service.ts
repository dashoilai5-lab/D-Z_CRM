import { db } from "@/lib/db";
import type { QuotationStatus } from "@prisma/client";

export interface QuoteLine {
  description: string;
  qty: number;
  unitPriceSen: number;
  lineTotalSen: number;
  kind: string;
}

async function snapJobLines(jobId: string): Promise<{ items: QuoteLine[]; totalSen: number }> {
  const job = await db.serviceJob.findUnique({
    where: { id: jobId },
    include: {
      items: { where: { status: { not: "DECLINED" } } },
      parts: { where: { status: { not: "DECLINED" } }, include: { product: true } },
    },
  });
  if (!job) throw new Error("Job not found");
  const items: QuoteLine[] = [
    ...job.items.map((i) => ({ description: i.description, qty: i.quantity, unitPriceSen: i.unitPriceSen, lineTotalSen: i.lineTotalSen, kind: i.kind || "SERVICE" })),
    ...job.parts.map((p) => ({ description: p.product?.name ?? "Part", qty: p.quantity, unitPriceSen: p.unitPriceSen, lineTotalSen: p.lineTotalSen, kind: "PART" })),
  ];
  const totalSen = items.reduce((s, i) => s + i.lineTotalSen, 0);
  return { items, totalSen };
}

/** Pre-service quotation: snapshot of the job lines for customer confirmation (approve/reject). */
export class QuotationService {
  /** Create (check-in) or re-send (counter edit) a quotation — snapshot current lines, set PENDING. */
  async send(jobId: string) {
    const snap = await snapJobLines(jobId);
    const existing = await db.quotation.findUnique({ where: { jobId } });
    return db.quotation.upsert({
      where: { jobId },
      create: { jobId, status: "PENDING", revision: 1, totalSen: snap.totalSen, itemsJson: JSON.stringify(snap.items), sentAt: new Date() },
      update: { status: "PENDING", revision: (existing?.revision ?? 0) + 1, totalSen: snap.totalSen, itemsJson: JSON.stringify(snap.items), sentAt: new Date(), respondedAt: null },
    });
  }

  /** Rider confirms or rejects the quotation. */
  respond(id: string, status: "APPROVED" | "REJECTED") {
    return db.quotation.update({ where: { id }, data: { status, respondedAt: new Date() } });
  }

  getForJob(jobId: string) {
    return db.quotation.findUnique({ where: { jobId } });
  }
}

export const quotationService = new QuotationService();
export type { QuotationStatus };
