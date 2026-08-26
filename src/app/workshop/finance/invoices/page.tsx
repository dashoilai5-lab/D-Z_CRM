import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { PayoutList } from "@/components/workshop/payout-list";
import { staffService } from "@/modules/staff/service";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PERIODS = ["day", "week", "month"] as const;

/** Foreman 薪资单（invoice = salary）：按日/周/月 + 技师分区，tick 发薪 / split 分期。 */
export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ period?: string; date?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const session = await getSessionUser();
  const isMechanic = session.kind === "staff" && session.role === "MECHANIC";

  const period = (PERIODS as readonly string[]).includes(sp.period ?? "") ? (sp.period as "day" | "week" | "month") : "week";
  const ref = sp.date ? new Date(sp.date + "T00:00:00Z") : undefined;
  const settle = await staffService.settlement(period, ref);

  const rows = isMechanic && session.user ? settle.foremen.filter((f) => f.id === session.user!.id) : settle.foremen;
  const rangeLabel = fmtDate(settle.start) + " – " + fmtDate(new Date(settle.end.getTime() - 86400000));
  const qs = (p: string, d?: string) => {
    const q = new URLSearchParams();
    q.set("period", p);
    if (d) q.set("date", d);
    return "/workshop/finance/invoices?" + q.toString();
  };

  return (
    <div>
      <PageHeader title={t("payout.title", lang)} subtitle={t("payout.subtitle", lang)} />

      {/* 周期切换（同 settlement 结构） */}
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
        <span className="text-xs text-muted-foreground ml-auto">{t("settle.period-label", lang)}: <strong>{t("settle." + period, lang)}</strong> · {rangeLabel}</span>
      </div>

      <PayoutList
        period={period}
        periodStart={settle.start.toISOString()}
        foremen={rows.map((f) => ({ id: f.id, name: f.name, jobs: f.jobs, baseSen: f.salaryBreakdown.baseSen, commissionSen: f.salaryBreakdown.commissionSen, addonBonusSen: f.salaryBreakdown.addonBonusSen, totalSen: f.salarySen }))}
        lang={lang}
      />
    </div>
  );
}
