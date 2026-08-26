import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SalaryRulesForm } from "@/components/workshop/salary-rules-form";
import { SettlementPayoutList } from "@/components/workshop/settlement-payout-list";
import { staffService } from "@/modules/staff/service";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const PERIODS = ["day", "week", "month"] as const;

/** Foreman 结算 + 发薪合并视图：业绩/薪资一屏看，tick 批量发薪 / split 分期，底部发薪历史。 */
export default async function SettlementsPage({ searchParams }: { searchParams: Promise<{ period?: string; date?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const session = await getSessionUser();
  const isMechanic = session.kind === "staff" && session.role === "MECHANIC";

  const period = (PERIODS as readonly string[]).includes(sp.period ?? "") ? (sp.period as "day" | "week" | "month") : "week";
  const ref = sp.date ? new Date(sp.date + "T00:00:00Z") : undefined;
  const [result, history] = await Promise.all([staffService.settlement(period, ref), staffService.payoutHistory()]);

  const rows = isMechanic && session.user ? result.foremen.filter((f) => f.id === session.user!.id) : result.foremen;
  const totalSalary = rows.reduce((s, f) => s + f.salarySen, 0);

  const qs = (p: string, d?: string) => {
    const q = new URLSearchParams();
    q.set("period", p);
    if (d) q.set("date", d);
    return "/workshop/settlements?" + q.toString();
  };
  const rangeLabel = fmtDate(result.start) + " – " + fmtDate(new Date(result.end.getTime() - 86400000));

  return (
    <div>
      <PageHeader title={t("settle.title", lang)} subtitle={t("settle.subtitle", lang)} />

      {/* 薪资规则（OWNER） */}
      {!isMechanic && (
        <details className="mb-4 rounded-2xl border bg-card open:ring-2 open:ring-primary/20">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold">
            <span>{t("settle.salary-rules", lang)}</span>
            <span className="text-xs font-normal text-muted-foreground">{t("settle.salary", lang)}</span>
          </summary>
          <div className="border-t p-4"><SalaryRulesForm rules={result.rules} /></div>
        </details>
      )}

      {/* 周期切换 + 日期 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {PERIODS.map((p) => (
          <Link key={p} href={qs(p, sp.date)} className={"rounded-full border px-3 py-1 text-xs font-medium transition-colors " + (period === p ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
            {t("settle." + p, lang)}
          </Link>
        ))}
        <form method="get" className="flex items-center gap-1 ml-2">
          <input type="hidden" name="period" value={period} />
          <input type="date" name="date" defaultValue={sp.date} className="rounded-md border bg-background px-3 py-1.5 text-xs" />
          <button className="rounded-md border px-2 py-1.5 text-xs font-medium">Go</button>
        </form>
        <span className="text-xs text-muted-foreground ml-auto">{t("settle.period-label", lang)}: <strong>{t("settle." + period, lang)}</strong> · {rangeLabel} · 薪资合计 {formatRM(totalSalary)}</span>
      </div>

      {/* 结算 + 发薪合并列表 */}
      <SettlementPayoutList
        period={period}
        periodStart={result.start.toISOString()}
        foremen={rows.map((f) => ({
          id: f.id, name: f.name, jobs: f.jobs, salesSen: f.salesSen, hours: f.hours,
          addonJobs: f.addonJobs, avgTicketSen: f.avgTicketSen,
          baseSen: f.salaryBreakdown.baseSen, commissionSen: f.salaryBreakdown.commissionSen, addonBonusSen: f.salaryBreakdown.addonBonusSen, totalSen: f.salarySen,
          payoutStatus: f.payout?.status ?? null, paidSen: f.payout?.paidSen ?? 0,
          jobsList: f.jobsList.map((j) => ({ id: j.id, jobNumber: j.jobNumber, serviceType: j.serviceType, completedAt: j.completedAt, salesSen: j.salesSen })),
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
                    <td className="px-3 py-2 text-muted-foreground">{t("settle." + (h.period as string), lang) || h.period} · {fmtDate(h.periodStart)}</td>
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
