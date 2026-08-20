import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { fmtKM, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MotorcyclesPage({ searchParams }: { searchParams: Promise<{ q?: string; brand?: string }> }) {
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const where: Record<string, unknown> = { customer: { organisationId: org!.id } };
  if (sp.q) {
    where.OR = [
      { plate: { contains: sp.q.toUpperCase() } },
      { vin: { contains: sp.q.toUpperCase() } },
      { brand: { contains: sp.q } },
      { model: { contains: sp.q } },
    ];
  }
  if (sp.brand) where.brand = sp.brand;
  const [bikes, brands] = await Promise.all([
    db.motorcycle.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { customer: { select: { id: true, name: true, phone: true } } } }),
    db.motorcycle.findMany({ where: { customer: { organisationId: org!.id } }, distinct: ["brand"], select: { brand: true } }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Motorcycles</h1>
          <p className="text-sm text-muted-foreground">{bikes.length} vehicles in the registry</p>
        </div>
        <Link href="/workshop/customers" className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">
          <Plus className="h-4 w-4" /> Register via Customer
        </Link>
      </div>

      <form method="get" className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input name="q" defaultValue={sp.q} placeholder="Search plate, VIN, brand, model…" className="w-full rounded-md border bg-background pl-8 pr-3 py-2 text-sm" />
        </div>
        <select name="brand" defaultValue={sp.brand} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
        </select>
        <button className="rounded-md border px-3 py-2 text-sm font-medium">Search</button>
      </form>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="dz-table">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-medium">Motorcycle</th>
              <th className="px-3 py-2.5 font-medium">Owner</th>
              <th className="px-3 py-2.5 font-medium">Mileage</th>
              <th className="px-3 py-2.5 font-medium">Last service</th>
              <th className="px-3 py-2.5 font-medium">Next service</th>
            </tr>
          </thead>
          <tbody>
            {bikes.map((m) => (
              <tr key={m.id} className="border-t hover:bg-muted/40" data-testid="bike-row">
                <td className="px-3 py-2.5">
                  <Link href={"/workshop/motorcycles/" + m.id} className="font-medium hover:underline">{m.brand} {m.model}</Link>
                  <div className="text-xs text-muted-foreground">{m.year} · {m.plate}{m.vin ? " · " + m.vin : ""}</div>
                </td>
                <td className="px-3 py-2.5 text-xs">{m.customer.name}</td>
                <td className="px-3 py-2.5 tabular-nums text-xs">{fmtKM(m.currentMileage)}</td>
                <td className="px-3 py-2.5 text-xs">{m.lastServiceDate ? fmtDate(m.lastServiceDate) : "—"}</td>
                <td className="px-3 py-2.5 text-xs">{m.nextServiceMileage ? fmtKM(m.nextServiceMileage) : "—"}</td>
              </tr>
            ))}
            {bikes.length === 0 && <tr><td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">No motorcycles found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
