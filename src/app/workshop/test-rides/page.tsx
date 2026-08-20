import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { testRidesModule } from "@/modules/test-rides/service";
import { TestRideList } from "@/components/workshop/test-ride-list";
import { NewTestRideForm } from "@/components/workshop/new-test-ride-form";

export const dynamic = "force-dynamic";

export default async function TestRidesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const [items, salespeople, leads] = await Promise.all([
    testRidesModule.list({ organisationId: org!.id, status: sp.status }),
    db.user.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.lead.findMany({ where: { organisationId: org!.id, status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, customerName: true, motorcycleInterest: true } }),
  ]);
  const branches = await db.branch.findMany({ where: { organisationId: org!.id } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Rides</h1>
          <p className="text-sm text-muted-foreground">{items.length} rides · Pending → Confirmed → Completed / Cancelled / No Show</p>
        </div>
        <details className="relative">
          <summary className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium cursor-pointer list-none">
            <Plus className="h-4 w-4" /> Schedule Ride
          </summary>
          <div className="absolute right-0 mt-2 w-80 z-20 rounded-xl border bg-card p-4 shadow-lg">
            <NewTestRideForm salespeople={salespeople} leads={leads} branches={branches.map((b) => ({ id: b.id, label: b.name + " · " + b.city }))} />
          </div>
        </details>
      </div>

      <form method="get" className="flex gap-2 text-sm">
        <a href="/workshop/test-rides" className={"rounded-md px-3 py-2 border " + (!sp.status ? "bg-primary text-primary-foreground border-primary" : "")}>All</a>
        {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].map((s) => (
          <a key={s} href={"/workshop/test-rides?status=" + s} className={"rounded-md px-3 py-2 border " + (sp.status === s ? "bg-primary text-primary-foreground border-primary" : "")}>
            {s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())}
          </a>
        ))}
      </form>

      <TestRideList items={items} />
    </div>
  );
}
