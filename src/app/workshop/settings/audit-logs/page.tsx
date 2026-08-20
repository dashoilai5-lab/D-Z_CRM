import { db } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<{ action?: string; entity?: string }> }) {
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const where: Record<string, unknown> = { organisationId: org!.id };
  if (sp.action) where.action = { contains: sp.action };
  if (sp.entity) where.entity = sp.entity;
  const [rows, actionGroups] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    db.auditLog.groupBy({ by: ["action"], where: { organisationId: org!.id }, _count: true, orderBy: { _count: { action: "desc" } }, take: 15 }),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Sensitive operations — login, bookings, job status, transfers, loyalty (AUDIT-001..015)</p>
      </div>
      <div className="flex gap-2 flex-wrap text-sm">
        <a href="/workshop/settings/audit-logs" className={"rounded-md border px-3 py-2 " + (!sp.action && !sp.entity ? "bg-primary text-primary-foreground" : "")}>All</a>
        {actionGroups.map((a) => (
          <a key={a.action} href={"/workshop/settings/audit-logs?action=" + encodeURIComponent(a.action)} className={"rounded-md border px-3 py-2 " + (sp.action === a.action ? "bg-primary text-primary-foreground" : "")}>
            {a.action} ({a._count})
          </a>
        ))}
      </div>
      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="dz-table">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Time</th><th className="px-3 py-2.5 font-medium">Action</th><th className="px-3 py-2.5 font-medium">Entity</th>
                <th className="px-3 py-2.5 font-medium">Branch</th><th className="px-3 py-2.5 font-medium">After</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 text-xs whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                  <td className="px-3 py-2 text-xs">{r.entity}{r.entityId ? " · " + r.entityId.slice(-8) : ""}</td>
                  <td className="px-3 py-2 text-xs">{r.branchId?.slice(-4) ?? "—"}</td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground max-w-xs truncate">{r.after ?? ""}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">No audit events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
