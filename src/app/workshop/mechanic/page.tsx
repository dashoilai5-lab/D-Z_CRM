import Link from "next/link";
import { jobService } from "@/modules/service-jobs/service";
import { StatusBadge } from "@/components/shared/status-badge";
import { fmtKM } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MechanicPage() {
  const board = await jobService.listBoard();
  const active = board.jobs.filter((j) => ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY"].includes(j.status));
  const mine = active.filter((j) => j.isToday);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Mechanic Board</h1>
      <p className="text-sm text-muted-foreground mb-5">Mobile-first job flow — grab a job, run the checklist, request approvals.</p>

      <div className="rounded-2xl border bg-card p-5 mb-5">
        <div className="text-xs text-muted-foreground">MY JOBS TODAY</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums">{mine.length}</span>
          <span className="text-sm text-muted-foreground">jobs</span>
          <div className="flex-1" />
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span><span className="font-semibold text-amber-600">{board.counts.AWAITING_APPROVAL}</span> approvals</span>
            <span><span className="font-semibold text-emerald-600">{board.counts.READY}</span> ready</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {mine.map((j) => (
          <Link key={j.id} href={"/workshop/mechanic/jobs/" + j.id} className="block rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold">#{j.jobNumber}</span>
              <StatusBadge kind="job" value={j.status} />
            </div>
            <div className="mt-2 font-semibold">{j.motorcycle.brand} {j.motorcycle.model}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{j.motorcycle.plate} · {j.customer.name}</div>
            <div className="mt-1.5 text-xs font-medium">{fmtKM(j.mileage)}{j.packageName ? " · " + j.packageName : ""}</div>
            {j.pendingApprovals > 0 && <div className="mt-2 text-xs font-semibold text-amber-600">⏳ {j.pendingApprovals} customer approval pending</div>}
          </Link>
        ))}
        {mine.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No active jobs right now.</p>}
      </div>
    </div>
  );
}
