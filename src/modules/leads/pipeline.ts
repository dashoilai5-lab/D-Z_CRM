// Pipeline analytics — stage counts/value, conversion, avg time in stage, stale.
import { db } from "@/lib/db";

export async function pipelineStats(organisationId: string, filter?: { assignedUserId?: string; sourceId?: string; motorcycleInterest?: string; branchId?: string }) {
  const stages = await db.leadStage.findMany({ where: { organisationId, active: true }, orderBy: { order: "asc" } });
  const where: Record<string, unknown> = { organisationId, status: "OPEN" };
  if (filter?.assignedUserId) where.assignedUserId = filter.assignedUserId;
  if (filter?.sourceId) where.sourceId = filter.sourceId;
  if (filter?.motorcycleInterest) where.motorcycleInterest = { contains: filter.motorcycleInterest };
  if (filter?.branchId) where.branchId = filter.branchId;

  const leads = await db.lead.findMany({
    where,
    include: { stage: true, activities: { orderBy: { createdAt: "asc" } } },
  });

  const byStage = new Map<string, { count: number; valueSen: number }>();
  for (const s of stages) byStage.set(s.id, { count: 0, valueSen: 0 });
  for (const l of leads) {
    const key = l.stageId ?? "none";
    const cur = byStage.get(key) ?? { count: 0, valueSen: 0 };
    cur.count += 1;
    cur.valueSen += l.estimatedValueSen ?? 0;
    byStage.set(key, cur);
  }

  // avg time in stage: for each lead, time since the activity that moved it into its current stage (or creation)
  let totalMs = 0;
  let samples = 0;
  for (const l of leads) {
    const enteredAt = l.activities.length > 0 ? l.activities[l.activities.length - 1].createdAt : l.createdAt;
    totalMs += Date.now() - enteredAt.getTime();
    samples += 1;
  }

  const total = leads.length;
  const won = await db.lead.count({ where: { organisationId, status: "WON" } });
  const lost = await db.lead.count({ where: { organisationId, status: "LOST" } });

  return {
    stages: stages.map((s) => ({ id: s.id, name: s.name, ...(byStage.get(s.id) ?? { count: 0, valueSen: 0 }) })),
    unassigned: byStage.get("none") ?? { count: 0, valueSen: 0 },
    total,
    totalValueSen: [...byStage.values()].reduce((a, b) => a + b.valueSen, 0),
    won,
    lost,
    conversionRate: total + won + lost > 0 ? Math.round((won / (total + won + lost)) * 100) : 0,
    avgDaysInStage: samples > 0 ? Math.round(totalMs / samples / 86400000) : 0,
  };
}
