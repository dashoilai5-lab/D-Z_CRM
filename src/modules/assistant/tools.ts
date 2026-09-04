import "server-only";
import { db } from "@/lib/db";
import { bookingService } from "@/modules/bookings/service";
import { financeService } from "@/modules/finance/service";

export interface AssistantCtx {
  orgId: string;
  branchId: string | null;
  role: string;
  lang: string;
}

export interface Guide {
  title: string;
  steps: string[];
}

/** Curated how-to guides (neutral English; the LLM localizes into the reply language). */
export const GUIDES: Record<"invoice" | "create-job" | "checkin", Guide> = {
  invoice: {
    title: "Create an invoice / record a payment",
    steps: [
      "Open a service job (Workshop → Jobs → a job). The invoice is issued automatically when the job is Completed.",
      "See all customer invoices in Workshop → Finance → Invoices.",
      "To record a payment: open the job (or the Invoices row) → payment panel → enter the amount and method (CASH / CARD / ONLINE / EWALLET) → Save. It auto-closes once fully paid.",
      "Download / print the invoice as PDF from the payment panel or the Invoices page.",
    ],
  },
  "create-job": {
    title: "Create a service / repair job",
    steps: [
      "Workshop → Jobs → Create Service Job (or Create Repair Job).",
      "Pick the customer + motorcycle, the service type (for REPAIR add parts & labour), and the mechanic.",
      "Save — the job appears on the board. Assign a mechanic to start work.",
    ],
  },
  checkin: {
    title: "Check in a booking",
    steps: [
      "Workshop → Bookings → open a confirmed booking → Check In.",
      "For SERVICE: a job (and a quotation for customer approval) is generated automatically.",
      "For REPAIR: after check-in, use Create Repair Job in the Bookings page and build the parts + labour.",
      "Send the quotation for customer approval before assigning a mechanic.",
    ],
  },
};

export interface ToolResult { context: string; }

export async function runTool(kind: string, ctx: AssistantCtx): Promise<ToolResult> {
  switch (kind) {
    case "booking_today": {
      const s = await bookingService.stats();
      return { context: "todayBookings=" + s.today + "; requested=" + s.requested + "; confirmed=" + s.confirmed };
    }
    case "revenue_today": {
      const d = await financeService.dashboard();
      // Pre-format the RM value so the model never does sen→RM math (it hallucinated before).
      const rm = "RM " + (d.revenue / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return { context: "todayRevenue=" + rm + " (" + d.revenue + " sen); todayInvoiceCount=" + d.count };
    }
    case "customers_count": {
      const n = await db.customer.count({ where: ctx.orgId ? { organisationId: ctx.orgId } : {} });
      return { context: "totalCustomers=" + n };
    }
    case "jobs_overview": {
      const where = ctx.branchId ? { branchId: ctx.branchId } : {};
      const active = await db.serviceJob.count({ where: { ...where, status: { notIn: ["COMPLETED", "CANCELLED"] } } });
      const done = await db.serviceJob.count({ where: { ...where, status: "COMPLETED" } });
      return { context: "activeJobs=" + active + "; completedJobs=" + done };
    }
    case "stock_alerts": {
      const where = ctx.branchId ? { branchId: ctx.branchId } : {};
      const low = await db.inventory.count({ where: { ...where, quantity: { lte: 3 } } });
      return { context: "lowStockItems=" + low };
    }
    case "reminders_due": {
      const due = await db.serviceReminder.count({ where: { status: { in: ["DUE", "OVERDUE"] } } });
      return { context: "dueReminders=" + due };
    }
    default:
      return { context: "" };
  }
}
