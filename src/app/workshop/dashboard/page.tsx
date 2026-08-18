import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { dashboardService } from "@/services/dashboard";
import { aiService } from "@/modules/ai/service";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";

export default async function DashboardPage() {
  const branch = await db.branch.findFirst({ where: { isMain: true } });
  const [dash, recs] = await Promise.all([
    dashboardService.get(branch?.id),
    aiService.recommendations(branch?.id),
  ]);

  const statusRows = [
    { status: "WAITING", label: "Waiting", count: dash.statuses.WAITING, cls: "bg-slate-500" },
    { status: "IN_PROGRESS", label: "In Progress", count: dash.statuses.IN_PROGRESS, cls: "bg-blue-500" },
    { status: "AWAITING_APPROVAL", label: "Awaiting Approval", count: dash.statuses.AWAITING_APPROVAL, cls: "bg-amber-500" },
    { status: "READY", label: "Ready", count: dash.statuses.READY, cls: "bg-emerald-500" },
    { status: "COMPLETED", label: "Completed", count: dash.statuses.COMPLETED, cls: "bg-emerald-700" },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, Daniel 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here is what is happening at D&Z Smart Workshop (Kuala Lumpur) today.</p>
      </div>

      {/* today metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Today's Sales" value={<Money sen={dash.todaySales} />} href="/workshop/finance/profit" />
        <StatCard label="Gross Profit" value={<Money sen={dash.todayGrossProfit} />} href="/workshop/finance/profit" tone="success" />
        <StatCard label="Jobs Today" value={dash.jobsToday} href="/workshop/jobs" />
        <StatCard label="Average Ticket" value={<Money sen={dash.avgTicket} />} href="/workshop/finance/profit" />
      </div>

      {/* workshop status */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Workshop Status</h2>
          <Link href="/workshop/jobs" className="text-xs font-medium text-primary flex items-center gap-1">View job board <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusRows.map((s) => (
            <Link key={s.status} href={"/workshop/jobs?status=" + s.status} className="flex items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-4 text-sm hover:border-primary/40 transition-colors">
              <span className={"h-2.5 w-2.5 rounded-full " + s.cls} />
              <span className="font-medium">{s.count}</span>
              <span className="text-muted-foreground text-xs">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* additional cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Customers Due" value={dash.customersDue} href="/workshop/crm/reminders" tone="danger" />
        <StatCard label="Critical Stock" value={dash.criticalStock} href="/workshop/inventory/alerts" tone="danger" />
        <StatCard label="Dead Stock Value" value={<Money sen={dash.deadStockValue} />} href="/workshop/inventory/dead-stock" tone="warn" />
        <StatCard label="Average Rating" value={dash.avgRating + " ★"} href="/workshop/marketing/reviews" />
        {dash.topPerformer && (
          <StatCard label="Top Performer" value={dash.topPerformer.name.split(" ")[0]} sub={"Score " + dash.topPerformer.score} href="/workshop/staff/kpi" tone="success" />
        )}
      </div>

      {/* AI recommendations */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">AI Command Centre</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {recs.map((r, i) => (
            <Link key={i} href={r.href} className="group rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors">
              <p className="font-medium text-sm">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-primary group-hover:underline">{r.action} →</span>
            </Link>
          ))}
          {recs.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No recommendations right now — everything is on track.</p>}
        </div>
      </section>

      {/* today's jobs snapshot */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Today's Jobs</h2>
          <Link href="/workshop/jobs" className="text-xs font-medium text-primary">All jobs →</Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {dash.board.jobs.filter((j) => j.isToday).slice(0, 9).map((j) => (
            <Link key={j.id} href={"/workshop/jobs/" + j.id} className="rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold">{j.jobNumber}</span>
                <StatusBadge kind="job" value={j.status} />
              </div>
              <div className="mt-2 font-semibold text-sm">{j.motorcycle.brand} {j.motorcycle.model}</div>
              <div className="text-xs text-muted-foreground">{j.motorcycle.plate} · {j.customer.name}</div>
              <div className="mt-2 text-sm font-semibold tabular-nums"><Money sen={j.totalSen} /></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
