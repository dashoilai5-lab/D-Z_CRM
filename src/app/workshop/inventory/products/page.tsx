import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { inventoryService } from "@/modules/inventory/service";
import { formatRM } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const rows = await inventoryService.productOptions();
  return (
    <div>
      <PageHeader title="Products" subtitle={rows.length + " products in the catalog"} />
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Cost</th><th className="px-4 py-3 font-medium">Sell</th><th className="px-4 py-3 font-medium">Margin</th>
            </tr></thead>
            <tbody>
              {rows.map((p) => {
                const margin = p.sellPriceSen > 0 ? Math.round(((p.sellPriceSen - p.costPriceSen) / p.sellPriceSen) * 100) : 0;
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-2.5 text-xs">{p.category?.replace("_", " ")}</td>
                    <td className="px-4 py-2.5 text-xs">{p.brand}</td>
                    <td className="px-4 py-2.5 tabular-nums">{formatRM(p.costPriceSen)}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{formatRM(p.sellPriceSen)}</td>
                    <td className="px-4 py-2.5 tabular-nums text-emerald-600">{margin}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
