import Link from "next/link";
import { Plus, Search, Phone, Mail, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { leadsModule } from "@/modules/leads/service";
import { formatRM } from "@/lib/money";
import { fmtDate } from "@/lib/format";
import { PendingForm } from "@/components/shared/search-form";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; stage?: string; source?: string; status?: string }> }) {
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const [stages, sources] = await Promise.all([
    db.leadStage.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { order: "asc" } }),
    db.leadSource.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { name: "asc" } }),
  ]);
  const { items, total } = await leadsModule.list({
    organisationId: org!.id,
    stageId: sp.stage,
    sourceId: sp.source,
    status: sp.status,
    search: sp.q,
  });
  const stageName = (id: string | null) => stages.find((s) => s.id === id)?.name ?? "—";
  const sourceName = (id: string | null) => sources.find((s) => s.id === id)?.name ?? "—";
  const stale = (d: Date | null) => d != null && d < new Date();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{total} leads · every enquiry becomes a lead</p>
        </div>
        <Link href="/workshop/leads/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">
          <Plus className="h-4 w-4" /> New Lead
        </Link>
      </div>

      <PendingForm className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input name="q" defaultValue={sp.q} placeholder="Search name, phone, email, lead #…" className="w-full rounded-md border bg-background pl-8 pr-3 py-2 text-sm" />
        </div>
        <select name="stage" defaultValue={sp.stage} className="rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
          <option value="">All stages</option>
          {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="source" defaultValue={sp.source} className="rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
          <option value="">All sources</option>
          {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="status" defaultValue={sp.status} className="rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
          <option value="">All status</option>
          <option value="OPEN">Open</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>
        <button className="rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors">Filter</button>
      </PendingForm>

      <div className="dz-panel overflow-x-auto">
        <table className="dz-table">
          <thead>
            <tr>
              <th className="px-3 py-2.5 font-medium">Lead</th>
              <th className="px-3 py-2.5 font-medium">Contact</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
              <th className="px-3 py-2.5 font-medium">Stage</th>
              <th className="px-3 py-2.5 font-medium">Value</th>
              <th className="px-3 py-2.5 font-medium">Owner</th>
              <th className="px-3 py-2.5 font-medium">Next follow-up</th>
              <th className="px-3 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id} data-testid="lead-row">
                <td className="px-3 py-2.5">
                  <div className="font-medium">{l.customerName}</div>
                  <div className="text-xs text-muted-foreground">{l.leadNumber}</div>
                </td>
                <td className="px-3 py-2.5">
                  {l.phone && <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{l.phone}</div>}
                  {l.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{l.email}</div>}
                </td>
                <td className="px-3 py-2.5 text-xs">{sourceName(l.sourceId)}</td>
                <td className="px-3 py-2.5 text-xs">{stageName(l.stageId)}</td>
                <td className="px-3 py-2.5 text-xs">{l.estimatedValueSen ? formatRM(l.estimatedValueSen) : "—"}</td>
                <td className="px-3 py-2.5 text-xs">{l.assignedUser?.name ?? "Unassigned"}</td>
                <td className="px-3 py-2.5 text-xs">
                  {l.nextFollowUpAt ? (
                    <span className={stale(l.nextFollowUpAt) ? "text-destructive font-medium" : ""}>{fmtDate(l.nextFollowUpAt)}</span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Link href={"/workshop/leads/" + l.id} className="inline-flex items-center text-xs text-primary hover:underline">Open <ArrowUpRight className="h-3 w-3" /></Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-sm text-muted-foreground">No leads match. Create one from the website enquiry form or manually.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
