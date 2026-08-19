import { PageHeader } from "@/components/shared/page-header";
import { marketingService } from "@/modules/marketing/service";
import { fmtDate } from "@/lib/format";
import { CampaignForm } from "@/components/workshop/marketing-forms";
import { isPromoActive } from "@/modules/marketing/promo";

export const dynamic = "force-dynamic";

const typeLabel: Record<string, string> = { RETURN: "Return", REMINDER: "Reminder", PROMO: "Promo", NEWS: "News" };
const statusTone: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  DRAFT: "bg-slate-100 text-slate-600",
  ENDED: "bg-slate-100 text-slate-400",
};

export default async function MarketingCalendarPage() {
  const { campaigns } = await marketingService.overview();
  const order = { ACTIVE: 0, SCHEDULED: 1, DRAFT: 2, ENDED: 3 } as const;
  const sorted = [...campaigns].sort((a, b) => (order[a.status as keyof typeof order] ?? 9) - (order[b.status as keyof typeof order] ?? 9) || a.startDate.getTime() - b.startDate.getTime());
  const activePromos = campaigns.filter((c) => isPromoActive(c as never));
  return (
    <div>
      <PageHeader title="Promotion Calendar" subtitle={campaigns.length + " campaigns · " + activePromos.length + " promo(s) live now"} action={<CampaignForm />} />
      <div className="space-y-2">
        {sorted.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-52 flex-1">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{typeLabel[c.type] ?? c.type} · {c.audience ?? "All"} · {fmtDate(c.startDate)}{c.endDate ? " → " + fmtDate(c.endDate) : ""}</div>
              </div>
              {c.type === "PROMO" && c.discountPercent && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">−{c.discountPercent}%</span>
              )}
              <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-bold " + (statusTone[c.status] ?? "bg-slate-100 text-slate-600")}>{c.status}</span>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No campaigns yet — create the first one.</p>}
      </div>
    </div>
  );
}
