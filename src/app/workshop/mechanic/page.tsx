import { jobService } from "@/modules/service-jobs/service";
import { db } from "@/lib/db";
import { getPersona } from "@/lib/demo";
import { getDemoUser } from "@/lib/demo-user";
import { MechanicBoard, type BoardJob, type MechanicSummary } from "@/components/workshop/mechanic-board";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function MechanicPage() {
  const lang = await getLang();
  const persona = await getPersona();
  const user = await getDemoUser(persona);
  const board = await jobService.listBoard();
  const active = board.jobs.filter((j) => ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY"].includes(j.status));

  // group active jobs by mechanic (including unassigned)
  const byMechanic = new Map<string, BoardJob[]>();
  for (const j of active) {
    const id = j.mechanic?.id ?? "unassigned";
    const arr = byMechanic.get(id) ?? [];
    arr.push({
      id: j.id, jobNumber: j.jobNumber, status: j.status, mileage: j.mileage,
      packageName: j.packageName, pendingApprovals: j.pendingApprovals,
      motorcycle: j.motorcycle, customer: j.customer, isToday: j.isToday,
    });
    byMechanic.set(id, arr);
  }

  // all active mechanics (0-job mechanics still appear), plus unassigned bucket
  const allMechanics = await db.user.findMany({ where: { role: "MECHANIC", active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const byId = new Map<string, { id: string; name: string; jobs: BoardJob[] }>();
  for (const m of allMechanics) byId.set(m.id, { id: m.id, name: m.name, jobs: [] });
  for (const [id, jobs] of byMechanic) {
    const cur = byId.get(id) ?? { id, name: id === "unassigned" ? t("ws.mech.unassigned", lang) : id, jobs: [] };
    cur.jobs = jobs;
    byId.set(id, cur);
  }
  byId.set("unassigned", { id: "unassigned", name: t("ws.mech.unassigned", lang), jobs: byMechanic.get("unassigned") ?? [] });

  const mechanics: MechanicSummary[] = [...byId.values()].map((m) => ({
    id: m.id,
    name: m.name,
    jobs: m.jobs,
    todayCount: m.jobs.filter((j) => j.isToday).length,
    approvals: m.jobs.filter((j) => j.status === "AWAITING_APPROVAL").length,
    ready: m.jobs.filter((j) => j.status === "READY").length,
  })).sort((a, b) => (a.id === "unassigned" ? 1 : 0) - (b.id === "unassigned" ? 1 : 0) || b.jobs.length - a.jobs.length);

  // MECHANIC persona defaults to their own card; OWNER defaults to the first (busiest)
  const initialMechanicId = persona === "MECHANIC" && user ? user.id : mechanics[0]?.id ?? "unassigned";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">{t("nav.mechanic", lang)}</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {persona === "OWNER" ? t("ws.mech.owner-hint", lang) : t("ws.mech.mech-hint", lang)}
      </p>
      <MechanicBoard mechanics={mechanics} initialMechanicId={initialMechanicId} ownerView={persona === "OWNER"} />
    </div>
  );
}
