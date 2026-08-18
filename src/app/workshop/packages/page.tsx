import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await db.servicePackage.findMany({ where: { active: true }, include: { items: true }, orderBy: { priceSen: "asc" } });
  return (
    <div>
      <PageHeader title="Service Packages" subtitle="GOOD · BETTER · BEST — the counter recommendation ladder" />
      <div className="grid md:grid-cols-3 gap-4">
        {packages.map((p) => (
          <div key={p.id} className={"rounded-3xl border p-6 " + (p.isBestValue ? "border-primary ring-2 ring-primary/20" : "bg-card")}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{p.tier}</span>
              {p.isBestValue && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">BEST VALUE</Badge>}
            </div>
            <h3 className="mt-2 text-xl font-bold">{p.name}</h3>
            <div className="mt-2 text-3xl font-bold tabular-nums">{formatRM(p.priceSen)}</div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {p.items.map((i) => (
                <li key={i.id} className="flex items-center gap-2"><span className="text-emerald-600">✓</span> {i.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
