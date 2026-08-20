// Analytics aggregation (ANA-001..051) — sales/service/customer/revenue/inventory views.
import { db } from "@/lib/db";

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

export async function salesAnalytics(orgId: string, sinceDays = 30) {
  const since = daysAgo(sinceDays);
  const [leads, bySource, byStage, won, lost] = await Promise.all([
    db.lead.findMany({ where: { organisationId: orgId, createdAt: { gte: since } }, include: { source: true, stage: true, assignedUser: { select: { name: true } } } }),
    db.lead.groupBy({ by: ["sourceId"], where: { organisationId: orgId, createdAt: { gte: since } }, _count: true }),
    db.lead.groupBy({ by: ["stageId"], where: { organisationId: orgId, status: "OPEN", createdAt: { gte: since } }, _count: true }),
    db.lead.count({ where: { organisationId: orgId, status: "WON", createdAt: { gte: since } } }),
    db.lead.count({ where: { organisationId: orgId, status: "LOST", createdAt: { gte: since } } }),
  ]);
  const sources = await db.leadSource.findMany({ where: { organisationId: orgId } });
  const stages = await db.leadStage.findMany({ where: { organisationId: orgId } });
  const bySalesperson: Record<string, number> = {};
  for (const l of leads) if (l.assignedUser) bySalesperson[l.assignedUser.name] = (bySalesperson[l.assignedUser.name] ?? 0) + 1;
  const byModel: Record<string, number> = {};
  for (const l of leads) if (l.motorcycleInterest) byModel[l.motorcycleInterest] = (byModel[l.motorcycleInterest] ?? 0) + 1;
  const total = leads.length;
  return {
    total, won, lost,
    conversionRate: total + won + lost > 0 ? Math.round((won / (total + won + lost)) * 100) : 0,
    bySource: sources.map((s) => ({ label: s.name, value: bySource.find((b) => b.sourceId === s.id)?._count ?? 0 })),
    byStage: stages.map((s) => ({ label: s.name, value: byStage.find((b) => b.stageId === s.id)?._count ?? 0 })),
    bySalesperson: Object.entries(bySalesperson).map(([label, value]) => ({ label, value })),
    byModel: Object.entries(byModel).slice(0, 8).map(([label, value]) => ({ label, value })),
    lostReasons: (await db.lead.groupBy({ by: ["lostReason"], where: { organisationId: orgId, status: "LOST", createdAt: { gte: since }, lostReason: { not: null } }, _count: true })).map((r) => ({ label: r.lostReason ?? "?", value: r._count })),
    stale: await db.lead.count({ where: { organisationId: orgId, status: "OPEN", nextFollowUpAt: { lt: new Date() } } }),
  };
}

export async function serviceAnalytics(orgId: string, sinceDays = 30) {
  const since = daysAgo(sinceDays);
  const [bookings, jobs, techs] = await Promise.all([
    db.booking.findMany({ where: { branch: { organisationId: orgId }, createdAt: { gte: since } } }),
    db.serviceJob.findMany({ where: { branch: { organisationId: orgId }, createdAt: { gte: since } }, include: { mechanic: { select: { name: true } }, items: true } }),
    db.user.findMany({ where: { organisationId: orgId, role: "MECHANIC", active: true }, include: { jobs: { where: { status: { in: ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "QC_CHECK", "WAITING_PARTS", "ON_HOLD", "READY"] } } } } }),
  ]);
  const completed = jobs.filter((j) => j.status === "COMPLETED");
  const avgCompletionMs = completed.length > 0 ? completed.reduce((s, j) => s + ((j.completedAt?.getTime() ?? j.createdAt.getTime()) - j.createdAt.getTime()), 0) / completed.length : 0;
  const topServices: Record<string, number> = {};
  for (const j of jobs) for (const i of j.items) if (i.status !== "DECLINED") topServices[i.description] = (topServices[i.description] ?? 0) + 1;
  return {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    noShow: bookings.filter((b) => b.status === "NO_SHOW").length,
    throughput: jobs.length,
    avgCompletionDays: Math.round(avgCompletionMs / 86400000),
    waitingParts: jobs.filter((j) => j.status === "WAITING_PARTS").length,
    technicianWorkload: techs.map((t) => ({ label: t.name, value: t.jobs.length })),
    topServices: Object.entries(topServices).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value })),
  };
}

export async function customerAnalytics(orgId: string, sinceDays = 30) {
  const since = daysAgo(sinceDays);
  const customers = await db.customer.findMany({ where: { organisationId: orgId }, include: { jobs: true, loyaltyAccount: true, referralsMade: true } });
  const newCount = customers.filter((c) => c.createdAt >= since).length;
  const repeat = customers.filter((c) => c.jobs.length >= 2).length;
  const inactive = customers.filter((c) => {
    const last = c.jobs.length > 0 ? Math.max(...c.jobs.map((j) => j.createdAt.getTime())) : 0;
    return last < daysAgo(90).getTime();
  }).length;
  return {
    total: customers.length,
    new: newCount,
    repeat,
    retentionRate: customers.length > 0 ? Math.round((repeat / customers.length) * 100) : 0,
    avgServiceFrequency: customers.length > 0 ? Math.round((customers.reduce((s, c) => s + c.jobs.length, 0) / customers.length) * 10) / 10 : 0,
    inactive,
    members: customers.filter((c) => c.loyaltyAccount).length,
    referrals: customers.reduce((s, c) => s + c.referralsMade.length, 0),
  };
}

export async function revenueAnalytics(orgId: string, sinceDays = 30) {
  const since = daysAgo(sinceDays);
  const invoices = await db.invoice.findMany({
    where: { branch: { organisationId: orgId }, issuedAt: { gte: since }, status: { not: "DRAFT" } },
    include: { branch: { select: { city: true } }, customer: { select: { name: true } }, items: true },
  });
  const total = invoices.reduce((s, i) => s + i.totalSen, 0);
  const byBranch: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byServiceType: Record<string, number> = {};
  for (const inv of invoices) {
    byBranch[inv.branch.city] = (byBranch[inv.branch.city] ?? 0) + inv.totalSen;
    for (const item of inv.items) {
      bySource[item.source] = (bySource[item.source] ?? 0) + item.lineTotalSen;
      if (item.source === "SERVICE" || item.source === "FEE") byServiceType[item.description] = (byServiceType[item.description] ?? 0) + item.lineTotalSen;
    }
  }
  const daily: Record<string, number> = {};
  for (let d = sinceDays; d >= 0; d--) {
    const key = daysAgo(d).toISOString().slice(0, 10);
    daily[key] = 0;
  }
  for (const inv of invoices) {
    const key = inv.issuedAt.toISOString().slice(0, 10);
    if (key in daily) daily[key] += inv.totalSen;
  }
  const perCustomer: Record<string, number> = {};
  for (const inv of invoices) perCustomer[inv.customer.name] = (perCustomer[inv.customer.name] ?? 0) + inv.totalSen;
  const repeatRevenue = invoices.filter((i) => perCustomer[i.customer.name] > 0 && invoices.filter((x) => x.customerId === i.customerId).length >= 2)
    .reduce((s, i) => s + i.totalSen, 0);
  // comparison period: previous window (daysAgo 2x .. daysAgo x)
  const prev = await db.invoice.aggregate({
    _sum: { totalSen: true },
    where: { branch: { organisationId: orgId }, issuedAt: { gte: daysAgo(sinceDays * 2), lt: since }, status: { not: "DRAFT" } },
  });
  const prevTotal = prev._sum.totalSen ?? 0;
  const pctChange = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;
  return {
    total,
    prevTotal,
    pctChange,
    trend: Object.entries(daily).map(([label, value]) => ({ label, value })),
    byBranch: Object.entries(byBranch).map(([label, value]) => ({ label, value })),
    bySource: Object.entries(bySource).map(([label, value]) => ({ label, value })),
    byServiceType: Object.entries(byServiceType).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value })),
    perCustomer: Object.entries(perCustomer).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value })),
    repeatRevenue,
    avgPerCustomer: customersWithRevenue(invoices),
  };
  function customersWithRevenue(invs: typeof invoices) {
    const names = new Set(invs.map((i) => i.customerId));
    return names.size > 0 ? Math.round(total / names.size) : 0;
  }
}

export async function inventoryAnalytics(orgId: string) {
  const products = await db.inventory.findMany({ where: { branch: { organisationId: orgId } }, include: { product: true, branch: { select: { city: true } } } });
  const byProduct: Record<string, { qty: number; min: number }> = {};
  for (const inv of products) {
    const p = byProduct[inv.product.name] ?? { qty: 0, min: inv.product.minStock };
    p.qty += inv.quantity;
    byProduct[inv.product.name] = p;
  }
  const stockRows = Object.entries(byProduct).map(([label, v]) => ({ label, qty: v.qty, min: v.min }));
  return {
    totalItems: stockRows.length,
    lowStock: stockRows.filter((r) => r.qty <= r.min && r.qty > 0).length,
    outOfStock: stockRows.filter((r) => r.qty <= 0).length,
    totalQty: stockRows.reduce((s, r) => s + r.qty, 0),
    byBranch: (await db.inventory.groupBy({ by: ["branchId"], where: { branch: { organisationId: orgId } }, _sum: { quantity: true } })).map((r) => ({ label: r.branchId.slice(-4), value: r._sum.quantity ?? 0 })),
    movements: await db.stockMovement.count({ where: { branch: { organisationId: orgId } } }),
    lowStockList: stockRows.filter((r) => r.qty <= r.min).sort((a, b) => a.qty - b.qty).slice(0, 10),
  };
}

export async function branchComparison(orgId: string) {
  const branches = await db.branch.findMany({ where: { organisationId: orgId } });
  const rows = await Promise.all(branches.map(async (b) => {
    const [leads, bookings, revenue, customers] = await Promise.all([
      db.lead.count({ where: { branchId: b.id } }),
      db.booking.count({ where: { branchId: b.id } }),
      db.invoice.aggregate({ _sum: { totalSen: true }, where: { branchId: b.id, status: { not: "DRAFT" } } }),
      db.customer.count({ where: { branchId: b.id } }),
    ]);
    return { id: b.id, city: b.city, leads, bookings, revenue: revenue._sum.totalSen ?? 0, customers };
  }));
  return rows.sort((a, b) => b.revenue - a.revenue);
}
