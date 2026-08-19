import { PageHeader } from "@/components/shared/page-header";
import { marketingService } from "@/modules/marketing/service";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { CampaignForm } from "@/components/workshop/marketing-forms";
import { CampaignActions } from "@/components/workshop/campaign-actions";
import { PromoCalendarGrid, type CalendarCampaign } from "@/components/workshop/promo-calendar-grid";
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

  // audience size: customers due for service (deterministic demo proxy for reach)
  const dueCustomers = await db.serviceReminder.count({ where: { status: { in: ["UPCOMING", "DUE_SOON", "DUE", "OVERDUE"] } } });
  // conversions: bookings attributed to each campaign
  const bookingsByCampaign = await db.booking.groupBy({ by: ["campaignId"], where: { campaignId: { not: null } }, _count: true });

  const order = { ACTIVE: 0, SCHEDULED: 1, DRAFT: 2, ENDED: 3 } as const;
  const sorted = [...campaigns].sort((a, b) => (order[a.status as keyof typeof order] ?? 9) - (order[b.status as keyof typeof order] ?? 9) || a.startDate.getTime() - b.startDate.getTime());
  const activePromos = campaigns.filter((c) => isPromoActive(c as never));
  const convMap = new Map(bookingsByCampaign.map((b) => [b.campaignId, b._count]));
  const calendarCampaigns: CalendarCampaign[] = campaigns.map((c) => ({
    id: c.id, name: c.name, type: c.type, status: c.status, startDate: c.startDate, endDate: c.endDate,
    discountPercent: c.discountPercent, conversions: convMap.get(c.id) ?? 0,
  }));

  return (
    <div>
      <PageHeader title="Promotion Calendar" subtitle={campaigns.length + " campaigns · " + activePromos.length + " promo(s) live now · " + dueCustomers + " customers due"} action={<CampaignForm />} />
      <div className="mb-5"><PromoCalendarGrid campaigns={calendarCampaigns} /></div>
      <div className="space-y-2">
        {sorted.map((c) => {
          const conversions = convMap.get(c.id) ?? 0;
          return (
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
                <CampaignActions id={c.id} status={c.status} />
              </div>
              {/* reach + conversion */}
              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
                  <span className="font-semibold text-foreground">{dueCustomers}</span> customers due
                </span>
                <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 " + (conversions > 0 ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-muted/50")}>
                  <span className={"font-semibold " + (conversions > 0 ? "text-emerald-700" : "text-foreground")}>{conversions}</span> bookings driven
                </span>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No campaigns yet — create the first one.</p>}
      </div>
    </div>
  );
}
