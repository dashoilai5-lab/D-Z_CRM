import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { Progress } from "@/components/ui/progress";
import { staffService } from "@/modules/staff/service";
import { formatRM } from "@/lib/money";
import { getPersona } from "@/lib/demo";
import { getDemoUser } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

export default async function KpiPage() {
  const persona = await getPersona();
  const user = await getDemoUser(persona);
  const { staff, top } = await staffService.kpiBoard(30);
  // data isolation: MECHANIC sees only their own KPI; OWNER sees the full board
  const rows = persona === "MECHANIC" && user ? staff.filter((s) => s.id === user.id) : staff;
  const myTop = persona === "MECHANIC" && user ? rows[0] ?? null : top;
  return (
    <div>
      <PageHeader title={persona === "MECHANIC" ? "My KPI" : "Staff KPI Board"} subtitle={persona === "MECHANIC" ? "Your performance — deterministic formulas (last 30 days)" : "Deterministic formulas — jobs, ticket, package & add-on conversion, checklist, rating (last 30 days)"} />
      {myTop && (
        <div className="mb-5 rounded-2xl bg-primary text-primary-foreground p-5 flex items-center gap-4">
          <div className="text-4xl font-bold tabular-nums">{myTop.score}</div>
          <div>
            <div className="font-semibold">{persona === "MECHANIC" ? myTop.name + " — your score" : myTop.name + " — top performer"}</div>
            <div className="text-xs opacity-90">{myTop.jobs} jobs · avg ticket {formatRM(myTop.avgTicketSen)} · {myTop.rating}★</div>
          </div>
        </div>
      )}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Staff</th><th className="px-4 py-3 font-medium">Jobs</th>
              <th className="px-4 py-3 font-medium">Sales</th><th className="px-4 py-3 font-medium">Avg Ticket</th>
              <th className="px-4 py-3 font-medium">Package Conv</th><th className="px-4 py-3 font-medium">Add-on Conv</th>
              <th className="px-4 py-3 font-medium">Checklist</th><th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Score</th>
            </tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.name}<div className="text-xs text-muted-foreground">{s.role.replace("_", " ")}</div></td>
                  <td className="px-4 py-3 tabular-nums">{s.jobs}</td>
                  <td className="px-4 py-3 tabular-nums"><Money sen={s.salesSen} /></td>
                  <td className="px-4 py-3 tabular-nums">{formatRM(s.avgTicketSen)}</td>
                  <td className="px-4 py-3 tabular-nums">{s.packageConversion}%</td>
                  <td className="px-4 py-3 tabular-nums">{s.addonConversion}%</td>
                  <td className="px-4 py-3 tabular-nums">{s.checklistCompletion}%</td>
                  <td className="px-4 py-3 tabular-nums">{s.rating}★</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={s.score} className="h-1.5 w-16" />
                      <span className="font-bold tabular-nums">{s.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">KPI formulas are deterministic and explainable (§33) — never AI-invented. Score = 30% jobs + 20% ticket + 15% package + 15% add-on + 10% checklist + 10% rating.</p>
    </div>
  );
}
