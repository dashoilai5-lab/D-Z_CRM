import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { crmService } from "@/modules/crm/service";
import { fmtDate, fmtKM } from "@/lib/format";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const SEGMENT: Record<string, { cls: string }> = {
  "30_PLUS": { cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  "60_PLUS": { cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  "90_PLUS": { cls: "bg-orange-50 text-orange-700 ring-orange-200" },
  LOST_CUSTOMER: { cls: "bg-red-50 text-red-700 ring-red-200" },
};

export default async function ReturnListPage() {
  const rows = await crmService.returnList();
  const lang = await getLang();
  return (
    <div>
      <PageHeader title={t("ws.crm.return.title", lang)} subtitle={t("ws.crm.return.subtitle", lang)} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {Object.entries(SEGMENT).map(([k, v]) => (
          <div key={k} className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{rows.filter((r) => r.segment === k).length}</div>
            <span className={"mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 " + v.cls}>{t("ws.crm.return.seg." + k, lang)}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">{t("ws.crm.return.col.customer", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.crm.return.col.motorcycle", lang)}</th>
              <th className="px-4 py-3 font-medium">{t("ws.crm.return.col.last-service", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.crm.return.col.days", lang)}</th>
              <th className="px-4 py-3 font-medium">{t("ws.crm.return.col.lifetime-value", lang)}</th><th className="px-4 py-3 font-medium">{t("ws.crm.return.col.segment", lang)}</th>
              <th className="px-4 py-3 font-medium">{t("ws.crm.return.col.recommended-action", lang)}</th><th className="px-4 py-3" />
            </tr></thead>
            <tbody>
              {rows.map((r) => {
                const seg = SEGMENT[r.segment] ?? { cls: "bg-slate-100 text-slate-700" };
                const segLabel = SEGMENT[r.segment] ? t("ws.crm.return.seg." + r.segment, lang) : r.segment;
                return (
                  <tr key={r.customerId} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3"><Link href={"/workshop/customers/" + r.customerId} className="font-medium hover:text-primary">{r.name}</Link><div className="text-xs text-muted-foreground">{r.phone}</div></td>
                    <td className="px-4 py-3 text-xs">{r.motorcycle ? r.motorcycle.brand + " " + r.motorcycle.model + " · " + r.motorcycle.plate : "—"}</td>
                    <td className="px-4 py-3 text-xs">{r.lastService ? fmtDate(r.lastService) : "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{r.daysSinceVisit ?? "—"}</td>
                    <td className="px-4 py-3 font-medium tabular-nums"><Money sen={r.lifetimeValueSen} /></td>
                    <td className="px-4 py-3"><span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 " + seg.cls}>{segLabel}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.recommendedAction}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Link href={"/workshop/customers/" + r.customerId} className="text-xs font-semibold text-primary hover:underline">{t("ws.crm.return.view-passport", lang)}</Link>
                        <Link href={"/workshop/jobs/new?customer=" + r.customerId} className="text-xs font-semibold text-primary hover:underline">{t("ws.crm.return.create-booking", lang)}</Link>
                      </div>
                    </td>
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
