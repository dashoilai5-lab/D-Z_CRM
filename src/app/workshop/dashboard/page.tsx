import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { dashboardService } from "@/services/dashboard";
import { aiService } from "@/modules/ai/service";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { getPersona } from "@/lib/demo";
import { getDemoUser } from "@/lib/demo-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const branch = await db.branch.findFirst({ where: { isMain: true } });
  const [dash, recs, persona, user, lang] = await Promise.all([
    dashboardService.get(branch?.id),
    aiService.recommendations(branch?.id),
    getPersona(),
    getDemoUser(await getPersona()),
    getLang(),
  ]);

  const statusRows = [
    { status: "WAITING", label: t("status.WAITING", lang), count: dash.statuses.WAITING, cls: "bg-slate-500" },
    { status: "IN_PROGRESS", label: t("status.IN_PROGRESS", lang), count: dash.statuses.IN_PROGRESS, cls: "bg-blue-500" },
    { status: "AWAITING_APPROVAL", label: t("status.AWAITING_APPROVAL", lang), count: dash.statuses.AWAITING_APPROVAL, cls: "bg-amber-500" },
    { status: "READY", label: t("status.READY", lang), count: dash.statuses.READY, cls: "bg-emerald-500" },
    { status: "COMPLETED", label: t("status.COMPLETED", lang), count: dash.statuses.COMPLETED, cls: "bg-emerald-700" },
  ] as const;

  const isOwner = persona === "OWNER";
  const isMechanic = persona === "MECHANIC";
  const greetingName = user?.name.split(" ")[0] ?? "Daniel";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dash.morning", lang) : hour < 18 ? t("dash.afternoon", lang) : t("dash.evening", lang);

  // data isolation: mechanic sees only their jobs in the snapshot
  const myJobs = isMechanic && user ? dash.board.jobs.filter((j) => j.mechanic?.id === user.id) : dash.board.jobs;
  const todayJobs = myJobs.filter((j) => j.isToday).slice(0, 9);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}, {greetingName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isMechanic ? t("dash.mechanic-sub", lang) : isOwner ? t("dash.owner-sub", lang) : t("dash.counter-sub", lang)}
        </p>
      </div>

      {/* today metrics — role-scoped */}
      {isMechanic ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard label={t("dash.my-active-jobs", lang)} value={myJobs.filter((j) => ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY"].includes(j.status)).length} href="/workshop/mechanic" />
          <StatCard label={t("dash.my-jobs-today", lang)} value={todayJobs.length} href="/workshop/jobs" />
          <StatCard label={t("dash.awaiting-approval", lang)} value={dash.statuses.AWAITING_APPROVAL} href="/workshop/jobs?status=AWAITING_APPROVAL" tone="warn" />
          <StatCard label={t("dash.ready", lang)} value={dash.statuses.READY} href="/workshop/jobs?status=READY" tone="success" />
        </div>
      ) : isOwner ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard label={t("dash.today-sales", lang)} value={<Money sen={dash.todaySales} />} href="/workshop/finance/profit" />
          <StatCard label={t("dash.gross-profit", lang)} value={<Money sen={dash.todayGrossProfit} />} href="/workshop/finance/profit" tone="success" />
          <StatCard label={t("dash.jobs-today", lang)} value={dash.jobsToday} href="/workshop/jobs" />
          <StatCard label={t("dash.avg-ticket", lang)} value={<Money sen={dash.avgTicket} />} href="/workshop/finance/profit" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard label={t("dash.jobs-today", lang)} value={dash.jobsToday} href="/workshop/jobs" />
          <StatCard label={t("dash.customers-due", lang)} value={dash.customersDue} href="/workshop/crm/reminders" tone="danger" />
          <StatCard label={t("dash.new-bookings", lang)} value={dash.statuses.WAITING + dash.statuses.IN_PROGRESS} href="/workshop/bookings" />
          <StatCard label={t("dash.avg-rating", lang)} value={dash.avgRating + " ★"} href="/workshop/marketing/reviews" />
        </div>
      )}

      {/* workshop status */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{t("dash.workshop-status", lang)}</h2>
          <Link href="/workshop/jobs" className="text-xs font-medium text-primary flex items-center gap-1">{t("dash.view-job-board", lang)} <ArrowRight className="h-3 w-3" /></Link>
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

      {/* additional cards — owner-only financials/stock/marketing */}
      {isOwner && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <StatCard label={t("dash.customers-due", lang)} value={dash.customersDue} href="/workshop/crm/reminders" tone="danger" />
          <StatCard label={t("dash.critical-stock", lang)} value={dash.criticalStock} href="/workshop/inventory/alerts" tone="danger" />
          <StatCard label={t("dash.dead-stock-value", lang)} value={<Money sen={dash.deadStockValue} />} href="/workshop/inventory/dead-stock" tone="warn" />
          <StatCard label={t("dash.avg-rating", lang)} value={dash.avgRating + " ★"} href="/workshop/marketing/reviews" />
          {dash.topPerformer && (
            <StatCard label={t("dash.top-performer", lang)} value={dash.topPerformer.name.split(" ")[0]} sub={t("dash.score", lang) + " " + dash.topPerformer.score} href="/workshop/staff/kpi" tone="success" />
          )}
        </div>
      )}

      {/* AI recommendations — owner & counter */}
      {!isMechanic && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">{t("dash.ai-centre", lang)}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {recs.map((r, i) => (
              <Link key={i} href={r.href} className="group rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors">
                <p className="font-medium text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
                <span className="inline-block mt-3 text-xs font-semibold text-primary group-hover:underline">{r.action} →</span>
              </Link>
            ))}
            {recs.length === 0 && <p className="text-sm text-muted-foreground col-span-2">{t("dash.no-recs", lang)}</p>}
          </div>
        </section>
      )}

      {/* today's jobs snapshot — role-scoped */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{isMechanic ? t("dash.my-today-jobs", lang) : t("dash.today-jobs", lang)}</h2>
          <Link href="/workshop/jobs" className="text-xs font-medium text-primary">{t("dash.all-jobs", lang)} →</Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {todayJobs.map((j) => (
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
          {todayJobs.length === 0 && <p className="text-sm text-muted-foreground col-span-3 text-center py-6">{isMechanic ? t("dash.no-jobs-assigned", lang) : t("dash.no-jobs-created", lang)}</p>}
        </div>
      </section>
    </div>
  );
}
