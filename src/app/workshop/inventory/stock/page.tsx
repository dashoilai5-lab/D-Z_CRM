import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { StockActions } from "@/components/workshop/stock-actions";
import { inventoryService } from "@/modules/inventory/service";
import { db } from "@/lib/db";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { PageTransition } from "@/components/shared/page-transition";

export const dynamic = "force-dynamic";

const LEVEL: Record<string, string> = {
  HEALTHY: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
  LOW: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
  CRITICAL: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900",
  OUT_OF_STOCK: "bg-slate-100 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 ring-slate-300",
};

export default async function StockPage() {
  const branch = await db.branch.findFirst({ where: { isMain: true } });
  const rows = await inventoryService.stockStatus(branch!.id);
  const lang = await getLang();
  const branches = await db.branch.findMany({ select: { id: true, name: true, city: true } });
  return (
    <PageTransition>
    <div>
      <PageHeader title={t("ws.stock.title", lang)} subtitle={t("ws.stock.subtitle", lang).replace("{branch}", "Kuala Lumpur")} />
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="dz-table">
            <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">{t("ws.stock.col.product", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.stock.col.qty", lang)}</th>
              <th className="px-4 py-3 font-medium">{t("ws.stock.col.min", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.stock.col.value", lang)}</th>
              <th className="px-4 py-3 font-medium">{t("ws.stock.col.days-left", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.stock.col.level", lang)}</th>
              <th className="px-4 py-3 font-medium">Adjust / Transfer</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.productId} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{r.name}<div className="text-xs text-muted-foreground font-mono">{r.sku}</div></td>
                  <td className="px-4 py-2.5 tabular-nums font-semibold">{r.quantity}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{r.minStock}</td>
                  <td className="px-4 py-2.5 tabular-nums"><Money sen={r.valueSen} /></td>
                  <td className="px-4 py-2.5 tabular-nums">{r.daysRemaining ?? "—"}</td>
                  <td className="px-4 py-2.5"><span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 " + (LEVEL[r.level] ?? "")}>{t("ws.stock.level." + r.level, lang)}</span></td>
                  <td className="px-4 py-2.5"><StockActions branchId={branch!.id} productId={r.productId} branches={branches.map((b) => ({ id: b.id, label: b.city }))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
