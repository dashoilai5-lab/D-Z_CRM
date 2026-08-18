import { crmService } from "@/modules/crm/service";
import { inventoryService } from "@/modules/inventory/service";
import { staffService } from "@/modules/staff/service";
import { db } from "@/lib/db";
import { DEFAULT_SERVICE_INTERVAL_KM } from "@/lib/constants";
import { formatRM } from "@/lib/money";

/**
 * AI Command Centre (§39) — rule-based in the prototype; OpenAI later.
 * AI is never the source of truth for money, stock, mileage or KPIs (§88).
 */
export class AiService {
  async recommendations(branchId?: string) {
    const out: {
      icon: string; title: string; detail: string; action: string; href: string; tone: "danger" | "warn" | "info" | "success";
    }[] = [];

    const reminders = await crmService.reminders();
    const overdue = reminders.filter((r) => r.status === "OVERDUE" || r.status === "DUE");
    if (overdue.length > 0) {
      const potential = overdue.length * 12000;
      out.push({
        icon: "users", title: overdue.length + " customer" + (overdue.length > 1 ? "s are" : " is") + " overdue for service.",
        detail: "Potential revenue " + formatRM(potential) + ". Send a WhatsApp reminder now.",
        action: "VIEW CUSTOMERS", href: "/workshop/crm/reminders", tone: "danger",
      });
    }

    if (branchId) {
      const recs = await inventoryService.reorderRecommendations(branchId);
      const urgent = recs.filter((r) => r.daysRemaining !== null && r.daysRemaining <= 7);
      if (urgent.length > 0) {
        out.push({
          icon: "box", title: urgent.length + " product" + (urgent.length > 1 ? "s" : "") + " may run out within 7 days.",
          detail: "Reorder " + urgent.slice(0, 3).map((u) => u.name).join(", ") + " before stock hits zero.",
          action: "REVIEW STOCK", href: "/workshop/inventory/stock", tone: "warn",
        });
      }

      const dead = await inventoryService.deadStock(branchId);
      const deadValue = dead.reduce((s, r) => s + r.valueSen, 0);
      if (deadValue > 0) {
        out.push({
          icon: "tag", title: formatRM(deadValue) + " is tied up in dead stock (" + dead.length + " items).",
          detail: "Create a promotion or bundle these items into service packages.",
          action: "CREATE PROMOTION", href: "/workshop/inventory/dead-stock", tone: "warn",
        });
      }
    }

    const kpi = await staffService.kpiBoard(30);
    if (kpi.staff.length > 0) {
      const withPkg = kpi.staff.filter((s) => s.packageConversion > 0);
      const avgConv = withPkg.length ? withPkg.reduce((s, x) => s + x.packageConversion, 0) / withPkg.length : 0;
      if (avgConv < 70) {
        out.push({
          icon: "trending", title: "Package conversion is " + Math.round(avgConv) + "%.",
          detail: "Train counter staff to recommend GOOD / BETTER / BEST at check-in.",
          action: "REVIEW KPI", href: "/workshop/staff/kpi", tone: "info",
        });
      }
    }
    return out;
  }

  /** Sales recommendations for a job (§23): oil filter / oil / brake check with reasons + script. */
  async salesRecommendations(jobId: string) {
    const job = await db.serviceJob.findUnique({
      where: { id: jobId },
      include: { motorcycle: true, parts: { include: { product: true } }, items: true },
    });
    if (!job) return [];
    return this.buildRecs(job.motorcycle, job.mileage, job.parts, job.items);
  }

  /** Recommendations for a motorcycle (used by the create-job form before the job exists). */
  async salesRecommendationsForMotorcycle(motorcycleId: string, mileage: number) {
    const m = await db.motorcycle.findUnique({ where: { id: motorcycleId } });
    if (!m) return [];
    return this.buildRecs(m, mileage, [], []);
  }

  private async buildRecs(
    m: { lastOilFilterMileage: number | null; lastOilChangeMileage: number | null; lastServiceMileage: number | null },
    mileage: number,
    parts: { product: { name: string } }[],
    items: { description: string }[]
  ) {
    const recs: { kind: "item" | "part"; description: string; reason: string; script: string; priceSen: number; productId?: string; unitCostSen?: number }[] = [];
    const distanceSinceFilter = mileage - (m.lastOilFilterMileage ?? 0);
    const distanceSinceOil = mileage - (m.lastOilChangeMileage ?? 0);
    const alreadyHasFilter = parts.some((p) => /filter/i.test(p.product.name)) || items.some((i) => /filter/i.test(i.description));

    if (distanceSinceFilter >= 5000 && !alreadyHasFilter) {
      const filter = await db.product.findFirst({ where: { name: { contains: "Oil Filter" } } });
      if (filter) {
        recs.push({
          kind: "part", description: filter.name, productId: filter.id, unitCostSen: filter.costPriceSen, priceSen: filter.sellPriceSen,
          reason: "Last replacement recorded " + distanceSinceFilter.toLocaleString() + " km ago.",
          script: "Abang, oil filter ni dah lama tak tukar. Kalau tukar sekali dengan minyak hitam, oil circulation akan lebih bersih.",
        });
      }
    }
    if (distanceSinceOil >= 3000 && !items.some((i) => /oil/i.test(i.description))) {
      recs.push({
        kind: "item", description: "Engine Oil (Semi-Synthetic 10W-40)", priceSen: 3500,
        reason: "Last oil change " + distanceSinceOil.toLocaleString() + " km ago.",
        script: "Minyak hitam dah lebih " + Math.floor(distanceSinceOil / 1000) + " ribu km. Tukar sekarang supaya enjin sentiasa licin dan jimat minyak.",
      });
    }
    if (mileage - (m.lastServiceMileage ?? 0) >= DEFAULT_SERVICE_INTERVAL_KM) {
      recs.push({
        kind: "item", description: "Brake Inspection + Service", priceSen: 1500,
        reason: "Recommended with every standard service for rider safety.",
        script: "Kami check brake sekali dengan servis — keselamatan abang nombor satu.",
      });
    }
    return recs;
  }
}

export const aiService = new AiService();
