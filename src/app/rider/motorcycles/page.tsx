import Link from "next/link";
import { Bike, ChevronRight, Plus } from "lucide-react";
import { getDemoCustomer } from "@/lib/demo-customer";
import { fmtKM } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MyMotorcyclesPage() {
  const customer = await getDemoCustomer();
  if (!customer) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Motorcycles</h1>
      <div className="space-y-3">
        {customer.motorcycles.map((m) => (
          <Link key={m.id} href={"/rider/motorcycles/" + m.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="font-semibold">{m.brand} {m.model}</div>
              <div className="text-xs text-muted-foreground">{m.plate} · {m.year} · {fmtKM(m.currentMileage)}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-sm font-medium text-muted-foreground">
        <Plus className="h-4 w-4" /> Add Motorcycle (soon)
      </button>
    </div>
  );
}
