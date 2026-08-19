import Link from "next/link";
import { Plus } from "lucide-react";
import { jobService } from "@/modules/service-jobs/service";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { JobActions } from "@/components/workshop/job-actions";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";
import { getPersona } from "@/lib/demo";
import { getDemoUser } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ status?: string; view?: string }> }) {
  const { status, view } = await searchParams;
  const persona = await getPersona();
  const user = await getDemoUser(persona);
  const board = await jobService.listBoard();
  // data isolation: MECHANIC sees only their assigned jobs
  const scoped = persona === "MECHANIC" && user ? board.jobs.filter((j) => j.mechanic?.id === user.id) : board.jobs;
  const filtered = status ? scoped.filter((j) => j.status === status) : scoped;
  const isKanban = view === "kanban";

  const columns = [
    { id: "WAITING", title: "Waiting", dot: "bg-slate-500" },
    { id: "IN_PROGRESS", title: "In Progress", dot: "bg-blue-500" },
    { id: "AWAITING_APPROVAL", title: "Awaiting Approval", dot: "bg-amber-500" },
    { id: "READY", title: "Ready", dot: "bg-emerald-500" },
    { id: "COMPLETED", title: "Completed", dot: "bg-emerald-700" },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Service Jobs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{board.jobsToday} jobs today · {board.counts.WAITING} waiting · {board.counts.AWAITING_APPROVAL} awaiting approval</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-card p-0.5 text-xs">
            <Link href="/workshop/jobs" className={"rounded-md px-3 py-1.5 font-medium " + (!isKanban ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Table</Link>
            <Link href="/workshop/jobs?view=kanban" className={"rounded-md px-3 py-1.5 font-medium " + (isKanban ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Kanban</Link>
          </div>
          <Link href="/workshop/jobs/new"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create Job</Button></Link>
        </div>
      </div>

      {/* status filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <Link href="/workshop/jobs" className={"rounded-full border px-3 py-1 text-xs font-medium " + (!status ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:border-primary/40")}>All {board.jobs.length}</Link>
        {columns.map((c) => (
          <Link key={c.id} href={"/workshop/jobs?status=" + c.id} className={"rounded-full border px-3 py-1 text-xs font-medium flex items-center gap-1.5 " + (status === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:border-primary/40")}>
            <span className={"h-2 w-2 rounded-full " + c.dot} />{c.title} {board.counts[c.id]}
          </Link>
        ))}
      </div>

      {isKanban ? (
        <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-3">
          {columns.map((col) => (
            <div key={col.id} className="rounded-2xl border bg-muted/20 p-2.5 min-h-40">
              <div className="flex items-center gap-2 px-1.5 pb-2 text-xs font-semibold text-muted-foreground">
                <span className={"h-2 w-2 rounded-full " + col.dot} />{col.title} <span className="tabular-nums">{board.counts[col.id]}</span>
              </div>
              <div className="space-y-2">
                {board.jobs.filter((j) => j.status === col.id).slice(0, 12).map((j) => (
                  <Link key={j.id} href={"/workshop/jobs/" + j.id} className="block rounded-xl border bg-card p-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold">{j.jobNumber}</span>
                      {j.pendingApprovals > 0 && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{j.pendingApprovals} approval{j.pendingApprovals > 1 ? "s" : ""}</span>}
                    </div>
                    <div className="mt-1 text-sm font-semibold">{j.motorcycle.brand} {j.motorcycle.model}</div>
                    <div className="text-[11px] text-muted-foreground">{j.motorcycle.plate} · {j.customer.name}</div>
                    <div className="mt-1.5 text-xs font-semibold tabular-nums"><Money sen={j.totalSen} /></div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Job</th><th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Motorcycle</th><th className="px-4 py-3 font-medium">Mileage</th>
                  <th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium">Mechanic</th>
                  <th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold"><Link href={"/workshop/jobs/" + j.id} className="hover:text-primary">{j.jobNumber}</Link></td>
                    <td className="px-4 py-3">
                      <Link href={"/workshop/customers/" + j.customer.id} className="font-medium hover:text-primary">{j.customer.name}</Link>
                      <div className="text-xs text-muted-foreground">{fmtDate(j.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{j.motorcycle.brand} {j.motorcycle.model}<div className="text-muted-foreground">{j.motorcycle.plate}</div></td>
                    <td className="px-4 py-3 tabular-nums">{j.mileage.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs max-w-40 truncate">{j.packageName ?? j.customerRequest ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{j.mechanic?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums"><Money sen={j.totalSen} /></td>
                    <td className="px-4 py-3"><StatusBadge kind="job" value={j.status} /></td>
                    <td className="px-4 py-3"><JobActions jobId={j.id} status={j.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
