import Link from "next/link";
import { CalendarDays, Clock, Wrench, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SalaryRulesForm } from "@/components/workshop/salary-rules-form";
import { staffService } from "@/modules/staff/service";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { formatRM } from "@/lib/money";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PERIODS = ["day", "week", "month"] as const;

/** Foreman 周期结算：按日/周/月聚合完成工单 + 服务金额 + 工时（老板视角，纯查询）。 */
export default async function SettlementsPage({ searchParams }: { searchParams: Promise<{ period?: string; date?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const session = await getSessionUser();
  const isMechanic = session.kind === "staff" && session.role === "MECHANIC";

  const period = (PERIODS as readonly string[]).includes(sp.period ?? "") ? (sp.period as "day" | "week" | "month") : "week";
  const ref = sp.date ? new Date(sp.date + "T00:00:00Z") : undefined;
  const result = await staffService.settlement(period, ref);

  // 数据隔离：MECHANIC 只看自己
  const rows = isMechanic && session.user ? result.foremen.filter((f) => f.id === session.user!.id) : result.foremen;
  const totals = isMechanic && session.user
    ? { jobs: rows.reduce((s, f) => s + f.jobs, 0), salesSen: rows.reduce((s, f) => s + f.salesSen, 0), hours: rows.reduce((s, f) => s + f.hours, 0), salarySen: rows.reduce((s, f) => s + f.salarySen, 0) }
    : result.totals;

  const periodLabel = t("settle." + period, lang);
  const rangeLabel = fmtDate(result.start) + " – " + fmtDate(new Date(result.end.getTime() - 86400000));

  const qs = (p: string, d?: string) => {
    const q = new URLSearchParams();
    q.set("period", p);
    if (d) q.set("date", d);
    return "/workshop/settlements?" + q.toString();
  };

  return (
    <div>
      <PageHeader title={t("settle.title", lang)} subtitle={t("settle.subtitle", lang)} />

      {/* 薪资规则（OWNER 可配置） */}
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
      <div className="flex flex-wrap items-center gap-2 mb-4">
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
        <span className="text-xs text-muted-foreground ml-auto">{t("settle.period-label", lang)}: <strong>{periodLabel}</strong> · {rangeLabel}</span>
      </div>

      {/* 总计条 */}
      <div className="grid grid-cols-2 gap-3 mb-5 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Wrench className="h-3.5 w-3.5" /> {t("settle.col-jobs", lang)}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{totals.jobs}</div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> {t("settle.col-sales", lang)}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{formatRM(totals.salesSen)}</div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {t("settle.col-hours", lang)}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{Math.round(totals.hours * 10) / 10}h</div>
        </div>
        <div className="rounded-2xl border bg-primary/10 p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-primary">{t("settle.salary", lang)}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-primary">{formatRM(totals.salarySen)}</div>
        </div>
      </div>

      {/* 每 foreman 卡 */}
      <div className="space-y-3">
        {rows.length === 0 && <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">{t("settle.empty", lang)}</div>}
        {rows.map((f) => (
          <details key={f.id} className="group rounded-2xl border bg-card open:ring-2 open:ring-primary/20">
            <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">{f.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.jobs} jobs · {formatRM(f.salesSen)} · {f.hours}h</div>
              </div>
              <div className="flex gap-4 text-right">
                <div><div className="text-sm font-bold tabular-nums">{f.jobs}</div><div className="text-[10px] text-muted-foreground">{t("settle.col-jobs", lang)}</div></div>
                <div><div className="text-sm font-bold tabular-nums">{formatRM(f.salesSen)}</div><div className="text-[10px] text-muted-foreground">{t("settle.col-sales", lang)}</div></div>
                <div><div className="text-sm font-bold tabular-nums">{f.hours}h</div><div className="text-[10px] text-muted-foreground">{t("settle.col-hours", lang)}</div></div>
                <div className="hidden sm:block"><div className="text-sm font-bold tabular-nums text-primary">{formatRM(f.salarySen)}</div><div className="text-[10px] text-muted-foreground">{t("settle.salary", lang)}</div></div>
              </div>
            </summary>
            <div className="border-t px-4 py-3">
              <div className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>{t("settle.col-avg", lang)}: <strong className="text-foreground">{formatRM(f.avgTicketSen)}</strong></span>
                <span>{t("settle.col-addon", lang)}: <strong className="text-foreground">{f.addonJobs}</strong></span>
              </div>
              <table className="dz-table w-full text-xs">
                <thead><tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Job</th><th className="px-2 py-2 font-medium">Service</th><th className="px-2 py-2 font-medium">Date</th><th className="px-2 py-2 text-right font-medium">Value</th>
                </tr></thead>
                <tbody>
                  {f.jobsList.map((j) => (
                    <tr key={j.id} className="border-b last:border-0">
                      <td className="px-2 py-2 font-mono"><Link href={"/workshop/jobs/" + j.id} className="text-primary hover:underline">{j.jobNumber}</Link></td>
                      <td className="px-2 py-2">{j.packageName ?? j.serviceType}</td>
                      <td className="px-2 py-2 text-muted-foreground"><CalendarDays className="mr-1 inline h-3 w-3" />{fmtDate(j.completedAt)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{formatRM(j.salesSen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
