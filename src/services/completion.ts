import { db } from "@/lib/db";
import { jobService } from "@/modules/service-jobs/service";
import { inventoryService } from "@/modules/inventory/service";
import { crmService } from "@/modules/crm/service";
import { paymentProvider, messagingProvider, notificationProvider } from "@/providers";
import { DEFAULT_SERVICE_INTERVAL_KM, AVG_KM_PER_MONTH } from "@/lib/constants";

export interface CompletionResult {
  jobId: string;
  jobNumber: string;
  revenueSen: number;
  cogsSen: number;
  grossProfitSen: number;
  invoiceNumber: string;
  nextServiceMileage: number;
  nextServiceEstDate: Date;
}

/**
 * CompletionService — the transactional service-completion workflow (§27).
 * All steps run inside ONE database transaction. Idempotent: completing an
 * already-completed job is a no-op.
 */
export class CompletionService {
  async complete(jobId: string): Promise<CompletionResult> {
    return db.$transaction(async (tx) => {
      const job = await tx.serviceJob.findUnique({
        where: { id: jobId },
        include: {
          customer: true,
          motorcycle: true,
          items: true,
          parts: { include: { product: true } },
          approvals: true,
          invoice: true,
          booking: true,
        },
      });
      if (!job) throw new Error("Job not found");
      if (job.status === "COMPLETED") {
        if (!job.invoice) throw new Error("Completed job has no invoice — data error");
        // idempotent: return existing result
        return {
          jobId: job.id, jobNumber: job.jobNumber,
          revenueSen: job.invoice.totalSen, cogsSen: 0, grossProfitSen: 0,
          invoiceNumber: job.invoice.invoiceNumber,
          nextServiceMileage: job.motorcycle.nextServiceMileage ?? 0,
          nextServiceEstDate: job.motorcycle.nextServiceEstDate ?? new Date(),
        };
      }
      if (job.status === "CANCELLED") throw new Error("Cannot complete a cancelled job");

      // §103 mileage validation — never go backwards silently
      if (job.mileage < job.motorcycle.currentMileage) {
        throw new Error(
          "Mileage regression: recorded " + job.mileage.toLocaleString() + " km is below current " +
          job.motorcycle.currentMileage.toLocaleString() + " km. A privileged correction is required."
        );
      }

      const acceptedItems = job.items.filter((i) => i.status !== "DECLINED");
      const acceptedParts = job.parts.filter((p) => p.status !== "DECLINED");

      // 1. Deduct inventory for accepted parts + create stock movements (§34)
      const branchId = job.branchId;
      for (const part of acceptedParts) {
        await inventoryService.deductStock(branchId, part.productId, part.quantity, "Service Job " + job.jobNumber, job.id, tx);
      }

      // 2. Build the invoice
      const year = new Date().getFullYear();
      const invCount = await tx.invoice.count({ where: { invoiceNumber: { startsWith: "DZ-" + year + "-" } } });
      const invoiceNumber = "DZ-" + year + "-" + String(invCount + 1).padStart(5, "0");
      const subtotal = acceptedItems.reduce((s, i) => s + i.lineTotalSen, 0) + acceptedParts.reduce((s, p) => s + p.lineTotalSen, 0);
      const cogs = acceptedParts.reduce((s, p) => s + p.unitCostSen * p.quantity, 0);
      const invoice = await tx.invoice.create({
        data: {
          branchId,
          customerId: job.customerId,
          jobId: job.id,
          invoiceNumber,
          status: "PAID",
          issuedAt: new Date(),
          subtotalSen: subtotal,
          totalSen: subtotal,
        },
      });
      for (const i of acceptedItems) {
        if (i.unitPriceSen === 0) continue; // verified component lines are not billed separately
        await tx.invoiceItem.create({
          data: { invoiceId: invoice.id, description: i.description, quantity: i.quantity, unitPriceSen: i.unitPriceSen, lineTotalSen: i.lineTotalSen, source: i.kind === "PART" ? "PART" : "SERVICE" },
        });
      }
      for (const p of acceptedParts) {
        if (p.unitPriceSen === 0) continue; // packaged consumables (oil) are covered by the package line
        await tx.invoiceItem.create({
          data: { invoiceId: invoice.id, description: p.product.name, quantity: p.quantity, unitPriceSen: p.unitPriceSen, lineTotalSen: p.lineTotalSen, source: "PART" },
        });
      }
      // demo: auto-pay via mock provider (§48 — no real payment processing)
      await paymentProvider.charge(subtotal, invoiceNumber, "CASH");
      await tx.payment.create({ data: { invoiceId: invoice.id, amountSen: subtotal, method: "CASH", status: "PAID", paidAt: new Date() } });

      // 3. Update motorcycle snapshot
      const nextMileage = job.mileage + DEFAULT_SERVICE_INTERVAL_KM;
      const nextDate = new Date(Date.now() + (DEFAULT_SERVICE_INTERVAL_KM / AVG_KM_PER_MONTH) * 30 * 86400000);
      await tx.motorcycle.update({
        where: { id: job.motorcycleId },
        data: {
          currentMileage: job.mileage,
          lastServiceDate: new Date(),
          lastServiceMileage: job.mileage,
          nextServiceMileage: nextMileage,
          nextServiceEstDate: nextDate,
        },
      });

      // 4. Close previous reminders, create the next-service reminder (§29)
      await tx.serviceReminder.updateMany({ where: { motorcycleId: job.motorcycleId, closedAt: null }, data: { closedAt: new Date() } });
      await tx.serviceReminder.create({
        data: {
          customerId: job.customerId,
          motorcycleId: job.motorcycleId,
          jobId: job.id,
          status: "UPCOMING",
          lastServiceMileage: job.mileage,
          intervalKm: DEFAULT_SERVICE_INTERVAL_KM,
          nextServiceMileage: nextMileage,
          estimatedDate: nextDate,
        },
      });

      // 5. Thank-you message + review request (§27.13-14) via providers
      await tx.message.create({
        data: {
          organisationId: job.customer.organisationId,
          branchId: job.branchId,
          customerId: job.customerId,
          jobId: job.id,
          direction: "OUT",
          channel: "WHATSAPP",
          body: "Hi " + job.customer.name.split(" ")[0] + ", motosikal awak dah siap! Total " + "RM" + (subtotal / 100).toLocaleString() + ". Terima kasih — D&Z Smart Workshop.",
          status: "SENT",
          referenceType: "COMPLETION",
        },
      });
      await tx.review.create({
        data: { branchId, customerId: job.customerId, jobId: job.id, status: "REQUESTED", requestedAt: new Date(), source: "APP" },
      });
      await tx.notification.create({
        data: { customerId: job.customerId, branchId, title: "Your motorcycle is ready", body: job.jobNumber + " — ready for collection.", type: "JOB_READY" },
      });

      // 6. Mark job completed + booking completed
      await tx.serviceJob.update({ where: { id: job.id }, data: { status: "COMPLETED", completedAt: new Date() } });
      if (job.booking?.id) {
        await tx.booking.update({ where: { id: job.booking.id }, data: { status: "COMPLETED" } });
      }

      const grossProfit = subtotal - cogs;
      return {
        jobId: job.id, jobNumber: job.jobNumber, revenueSen: subtotal, cogsSen: cogs, grossProfitSen: grossProfit,
        invoiceNumber, nextServiceMileage: nextMileage, nextServiceEstDate: nextDate,
      };
    }, { timeout: 60000 });
  }
}

export const completionService = new CompletionService();
