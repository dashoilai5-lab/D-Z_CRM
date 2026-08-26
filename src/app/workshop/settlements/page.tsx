import Link from "next/link";
import { Bike } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SalaryRulesForm } from "@/components/workshop/salary-rules-form";
import { ForemanPayoutView } from "@/components/workshop/foreman-payout-view";
import { staffService } from "@/modules/staff/service";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { periodWindow } from "@/lib/period";

export const dynamic = "force-dynamic";

const DAY_FILTERS = [
  { key: "1", label: "Today", days: 1 },
  { key: "3", label: "3 days", days: 3 },
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days & above", days: 30 },
];

/** Foreman 发薪中心 + 每日服务车辆：先点技师发薪；下方按天看当天服务的车。 */
export default async function SettlementsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const session = await getSessionUser();
  const isMechanic = session.kind === "staff" && session.role === "MECHANIC";

  const days = DAY_FILTERS.some((f) => f.key === sp.days) ? Number(sp.days) : 7;
  const [result, history] = await Promise.all([staffService.settlementByDay(days), staffService.payoutHistory()]);
  const foremen = isMechanic && session.user ? result.foremen.filter((f) => f.id === session.user!.id) : result.foremen;

  // 每日服务车辆（窗口内完成工单，按 +8 日分组）
  const window = periodWindow("day", result.end);
  const vehiclesStart = new Date(window.start.getTime() - (days - 1) * 86400000);
  const jobs = await db.serviceJob.findMany({
    where: { status: "COMPLETED", completedAt: { gte: vehiclesStart, lt: result.end } },
    include: { motorcycle: { select: { plate: true, brand: true, model: true } }, customer: { select: { name: true } } },
    orderBy: { completedAt: "asc" },
  });
  const jobIds = jobs.map((j) => j.id);
  const invs = jobIds.length ? await db.invoice.findMany({ where: { jobId: { in: jobIds } }, select: { jobId: true, totalSen: true } }) : [];
  const salesByJob = new Map<string, number>();
  for (const inv of invs) if (inv.jobId) salesByJob.set(inv.jobId, (salesByJob.get(inv.jobId) ?? 0) + inv.totalSen);
  const dayVehicles = new Map<string, { plate: string; customer: string; service: string; salesSen: number; jobId: string }[]>();
  for (const j of jobs) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(j.completedAt!);
    const arr = dayVehicles.get(key) ?? [];
    arr.push({ plate: j.motorcycle.plate, customer: j.customer.name, service: j.packageName ?? "", salesSen: salesByJob.get(j.id) ?? 0, jobId: j.id });
    dayVehicles.set(key, arr);
  }
  const daysList = [...dayVehicles.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const qs = (d: string) => "/workshop/settlements?days=" + d;

  return (
    <div>
      <PageHeader title={t("settle.title", lang)} subtitle={t("settle.subtitle", lang)} />

      {!isMechanic && (
        <details className="mb-4 rounded-2xl border bg-card open:ring-2 open:ring-primary/20">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold">
            <span>{t("settle.salary-rules", lang)}</span>
            <span className="text-xs font-normal text-muted-foreground">{t("settle.salary", lang)}</span>
          </summary>
          <div className="border-t p-4"><SalaryRulesForm rules={result.rules} /></div>
        </details>
      )}

      {/* 时间 filter */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {DAY_FILTERS.map((f) => (
          <Link key={f.key} href={qs(f.key)} className={"rounded-full border px-3 py-1 text-xs font-medium transition-colors " + (days === f.days ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
            {f.label}
          </Link>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{fmtDate(vehiclesStart)} – {fmtDate(result.end)}</span>
      </div>

      {/* 每日服务车辆 */}
      <div className="rounded-2xl border bg-card p-4 mb-4">
        <h3 className="font-semibold mb-3">Daily services</h3>
        {daysList.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No services in this period.</p>}
        <div className="space-y-3">
          {daysList.map(([day, vehicles]) => (
            <div key={day}>
              <div className="mb-1.5 text-xs font-semibold text-muted-foreground">{fmtDate(new Date(day + "T00:00:00Z"))} · {vehicles.length} bike{vehicles.length > 1 ? "s" : ""}</div>
              <div className="space-y-1">
                {vehicles.map((v) => (
                  <Link key={v.jobId} href={"/workshop/jobs/" + v.jobId} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs hover:bg-muted/70">
                    <Bike className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="font-mono font-semibold">{v.plate}</span>
                    <span className="text-muted-foreground">{v.customer}</span>
                    <span className="text-muted-foreground">{v.service}</span>
                    <span className="ml-auto font-bold tabular-nums">{formatRM(v.salesSen)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* foreman 中心发薪 */}
      <ForemanPayoutView
        foremen={foremen.map((f) => ({
          id: f.id, name: f.name, totalJobs: f.totalJobs, totalSalesSen: f.totalSalesSen, totalSen: f.totalSen,
          daily: f.daily.map((b) => ({ date: b.date, jobs: b.jobs, salesSen: b.salesSen, baseSen: b.baseSen, commissionSen: b.commissionSen, addonBonusSen: b.addonBonusSen, totalSen: b.totalSen, payoutStatus: b.payout?.status ?? null, paidSen: b.payout?.paidSen ?? 0 })),
        }))}
        lang={lang}
      />

      {/* 发薪历史 */}
      <div className="mt-8 rounded-2xl border bg-card p-4">
        <h3 className="font-semibold mb-3">Payout history</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No payouts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="dz-table w-full text-xs">
              <thead><tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Date</th><th className="px-3 py-2 font-medium">Foreman</th><th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 text-right font-medium">Salary</th><th className="px-3 py-2 text-right font-medium">Paid</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">Payments</th>
              </tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{h.paidAt ? fmtDateTime(h.paidAt) : "—"}</td>
                    <td className="px-3 py-2 font-medium">{h.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{h.period} · {fmtDate(h.periodStart)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatRM(h.totalSen)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatRM(h.paidSen)}</td>
                    <td className="px-3 py-2"><span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (h.status === "PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : h.status === "PARTIAL" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>{h.status}</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{h.payments.map((p) => formatRM(p.amountSen) + " " + p.method).join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
