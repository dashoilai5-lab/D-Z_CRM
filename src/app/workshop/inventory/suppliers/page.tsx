import { PageHeader } from "@/components/shared/page-header";
import { inventoryService } from "@/modules/inventory/service";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await inventoryService.suppliers();
  return (
    <div>
      <PageHeader title="Suppliers" subtitle={suppliers.length + " suppliers"} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suppliers.map((s) => (
          <div key={s.id} className="rounded-2xl border bg-card p-4">
            <div className="font-semibold">{s.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.contactName} · {s.phone}</div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-muted-foreground">{s.productCount} products</span>
              <span className="font-medium">{s.leadTimeDays} days lead time</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
