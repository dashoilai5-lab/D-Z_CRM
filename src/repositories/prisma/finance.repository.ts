import type { Prisma, PrismaClient } from "@prisma/client";
import type { DbLike, IFinanceRepository, InvoiceFull } from "@/modules/finance/repository";
import { db } from "@/lib/db";

const invoiceInclude = {
  items: true,
  payments: true,
  job: { include: { motorcycle: true, customer: true } },
  customer: true,
} satisfies Prisma.InvoiceInclude;

export class PrismaFinanceRepository implements IFinanceRepository {
  private c(client?: DbLike): PrismaClient | Prisma.TransactionClient { return client ?? db; }
  listInvoices(client?: DbLike) { return this.c(client).invoice.findMany({ include: invoiceInclude, orderBy: { issuedAt: "desc" } }); }
  getInvoice(id: string, client?: DbLike) { return this.c(client).invoice.findUnique({ where: { id }, include: invoiceInclude }); }
  getByJob(jobId: string, client?: DbLike) { return this.c(client).invoice.findFirst({ where: { jobId }, include: invoiceInclude }); }
  getByNumber(num: string, client?: DbLike) { return this.c(client).invoice.findUnique({ where: { invoiceNumber: num }, include: invoiceInclude }); }
  createInvoice(data: Prisma.InvoiceCreateInput, client?: DbLike) { return this.c(client).invoice.create({ data, include: invoiceInclude }); }
  createInvoiceItem(data: Prisma.InvoiceItemCreateInput, client?: DbLike) { return this.c(client).invoiceItem.create({ data }); }
  createPayment(data: Prisma.PaymentCreateInput, client?: DbLike) { return this.c(client).payment.create({ data }); }
  count(client?: DbLike) { return this.c(client).invoice.count(); }
  async nextInvoiceNumber(client?: DbLike) {
    const c = this.c(client);
    const year = new Date().getFullYear();
    const count = await c.invoice.count({ where: { invoiceNumber: { startsWith: "DZ-" + year + "-" } } });
    return "DZ-" + year + "-" + String(count + 1).padStart(5, "0");
  }
}
