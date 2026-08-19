import { jobService } from "@/modules/service-jobs/service";
import { getPersona } from "@/lib/demo";
import { getDemoUser } from "@/lib/demo-user";
import { MechanicBoard, type BoardJob, type MechanicSummary } from "@/components/workshop/mechanic-board";

export const dynamic = "force-dynamic";

export default async function MechanicPage() {
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

  // mechanic names: from the jobs themselves; ensure every staff mechanic appears
  const nameById = new Map<string, string>();
  for (const j of active) if (j.mechanic?.id && j.mechanic.name) nameById.set(j.mechanic.id, j.mechanic.name);
  nameById.set("unassigned", "Unassigned");

  const mechanics: MechanicSummary[] = [...byMechanic.entries()].map(([id, jobs]) => ({
    id,
    name: nameById.get(id) ?? id,
    jobs,
    todayCount: jobs.filter((j) => j.isToday).length,
    approvals: jobs.filter((j) => j.status === "AWAITING_APPROVAL").length,
    ready: jobs.filter((j) => j.status === "READY").length,
  })).sort((a, b) => (a.id === "unassigned" ? 1 : 0) - (b.id === "unassigned" ? 1 : 0) || b.jobs.length - a.jobs.length);

  // MECHANIC persona defaults to their own card; OWNER defaults to the first (busiest)
  const initialMechanicId = persona === "MECHANIC" && user ? user.id : mechanics[0]?.id ?? "unassigned";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Mechanic Board</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {persona === "OWNER" ? "Switch between mechanics to view their assigned tasks." : "Your assigned jobs — switch to see other mechanics."}
      </p>
      <MechanicBoard mechanics={mechanics} initialMechanicId={initialMechanicId} ownerView={persona === "OWNER"} />
    </div>
  );
}
