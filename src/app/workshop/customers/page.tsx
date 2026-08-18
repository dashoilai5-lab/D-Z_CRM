import Link from "next/link";
import { Search } from "lucide-react";
import { customerService } from "@/modules/customers/service";
import { Money } from "@/components/shared/money";
import { fmtDate, fmtKM } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const summaries = await customerService.listSummaries();
  const filtered = q?.trim() ? summaries.filter((c) => (c.name + " " + (c.phone ?? "") + " " + c.motorcycles.map((m) => m.plate + m.model).join(" ")).toLowerCase().includes(q.toLowerCase())) : summaries;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{summaries.length} customers · Rider Passport for every bike</p>
        </div>
        <form className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input name="q" defaultValue={q ?? ""} placeholder="Search name or phone…" className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </form>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Motorcycle</th>
                <th className="px-4 py-3 font-medium">Visits</th>
                <th className="px-4 py-3 font-medium">Lifetime Spend</th>
                <th className="px-4 py-3 font-medium">Last Visit</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={"/workshop/customers/" + c.id} className="font-medium hover:text-primary">{c.name}</Link>
                    <div className="text-xs text-muted-foreground">{c.phone ?? "—"} · since {fmtDate(c.joinedAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    {c.motorcycles.map((m) => (
                      <div key={m.id} className="text-xs">
                        <span className="font-medium">{m.brand} {m.model}</span> · {m.plate}
                        <span className="text-muted-foreground"> · {fmtKM(m.currentMileage)}</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{c.visits}</td>
                  <td className="px-4 py-3 tabular-nums font-medium"><Money sen={c.lifetimeSpendSen} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lastVisitAt ? fmtDate(c.lastVisitAt) : "—"}</td>
                  <td className="px-4 py-3">
                    {c.dueStatus === "DUE" && <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">DUE</span>}
                    {c.dueStatus === "DUE_SOON" && <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">DUE SOON</span>}
                    {c.dueStatus === "UPCOMING" && <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">UPCOMING</span>}
                    {c.dueStatus === "BOOKED" && <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">BOOKED</span>}
                    {c.dueStatus === "NONE" && <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
