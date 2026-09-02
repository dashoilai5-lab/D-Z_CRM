import { PageHeader } from "@/components/shared/page-header";
import { marketingService } from "@/modules/marketing/service";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { CampaignForm } from "@/components/workshop/marketing-forms";
import { CampaignActions } from "@/components/workshop/campaign-actions";
import { BroadcastButton } from "@/components/workshop/broadcast-button";
import { PromoCalendarGrid, type CalendarCampaign } from "@/components/workshop/promo-calendar-grid";
import { isPromoActive } from "@/modules/marketing/promo";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const typeKey: Record<string, string> = {
  RETURN: "ws.mkt.calendar.type.RETURN",
  REMINDER: "ws.mkt.calendar.type.REMINDER",
  PROMO: "ws.mkt.calendar.type.PROMO",
  NEWS: "ws.mkt.calendar.type.NEWS",
};
const statusKey: Record<string, string> = {
  ACTIVE: "ws.mkt.status.ACTIVE",
  SCHEDULED: "ws.mkt.status.SCHEDULED",
  DRAFT: "ws.mkt.status.DRAFT",
  ENDED: "ws.mkt.status.ENDED",
};
const statusTone: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  DRAFT: "bg-slate-100 text-slate-600 dark:text-slate-300",
  ENDED: "bg-slate-100 text-slate-400",
};

export default async function MarketingCalendarPage() {
  const lang = await getLang();
  const { campaigns } = await marketingService.overview();

  // audience size: customers due for service (deterministic demo proxy for reach)
  const dueCustomers = await db.serviceReminder.count({ where: { status: { in: ["UPCOMING", "DUE_SOON", "DUE", "OVERDUE"] } } });
  // conversions: bookings attributed to each campaign
  const bookingsByCampaign = await db.booking.groupBy({ by: ["campaignId"], where: { campaignId: { not: null } }, _count: true });
  // broadcast stats per campaign (grouped by delivery status)
  const msgsByCampaign = await db.message.groupBy({ by: ["referenceId", "status"], where: { referenceType: "CAMPAIGN", referenceId: { not: null } }, _count: true });
  const msgStats = new Map<string, { sent: number; delivered: number; failed: number }>();
  for (const m of msgsByCampaign) {
    const ref = m.referenceId;
    if (!ref) continue;
    const cur = msgStats.get(ref) ?? { sent: 0, delivered: 0, failed: 0 };
    if (m.status === "FAILED") cur.failed += m._count;
    else if (m.status === "DELIVERED" || m.status === "READ") cur.delivered += m._count;
    cur.sent += m._count;
    msgStats.set(ref, cur);
  }

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
      <PageHeader
        title={t("ws.mkt.calendar.title", lang)}
        subtitle={[
          t("ws.mkt.calendar.campaigns", lang).replace("{n}", String(campaigns.length)),
          t("ws.mkt.calendar.promo-live", lang).replace("{n}", String(activePromos.length)),
          t("ws.mkt.calendar.customers-due", lang).replace("{n}", String(dueCustomers)),
        ].join(" · ")}
        action={<CampaignForm />}
      />
      <div className="mb-5"><PromoCalendarGrid campaigns={calendarCampaigns} /></div>
      <div data-tut="calendar-list" className="space-y-2">
        {sorted.map((c) => {
          const conversions = convMap.get(c.id) ?? 0;
          return (
            <div key={c.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-52 flex-1">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{(typeKey[c.type] ? t(typeKey[c.type], lang) : c.type)} · {c.audience ?? t("ws.mkt.calendar.all", lang)} · {fmtDate(c.startDate)}{c.endDate ? " → " + fmtDate(c.endDate) : ""}</div>
                </div>
                {c.type === "PROMO" && c.discountPercent && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">−{c.discountPercent}%</span>
                )}
                <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-bold " + (statusTone[c.status] ?? "bg-slate-100 text-slate-600 dark:text-slate-300")}>{statusKey[c.status] ? t(statusKey[c.status], lang) : c.status}</span>
                <CampaignForm
                  initial={{ id: c.id, name: c.name, type: c.type, status: c.status, audience: c.audience ?? null, startDate: c.startDate, endDate: c.endDate, discountPercent: c.discountPercent }}
                />
                <BroadcastButton campaignId={c.id} stats={msgStats.get(c.id) ?? { sent: 0, delivered: 0, failed: 0 }} />
                <CampaignActions id={c.id} status={c.status} />
              </div>
              {/* reach + conversion */}
              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
                  <span className="font-semibold text-foreground">{dueCustomers}</span> {t("ws.mkt.calendar.customers-due-label", lang)}
                </span>
                <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 " + (conversions > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 ring-1 ring-emerald-200" : "bg-muted/50")}>
                  <span className={"font-semibold " + (conversions > 0 ? "text-emerald-700" : "text-foreground")}>{conversions}</span> {t("ws.mkt.calendar.bookings-driven", lang)}
                </span>
                {(() => { const s = msgStats.get(c.id); if (!s || s.sent === 0) return null; return (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
                    <span className="font-semibold text-foreground">{s.sent}</span> {t("ws.mkt.calendar.sent", lang)}
                    {s.delivered > 0 && <><span className="text-emerald-600 dark:text-emerald-400 font-semibold">{s.delivered}</span> {t("ws.mkt.calendar.delivered", lang)}</>}
                    {s.failed > 0 && <><span className="text-red-600 dark:text-red-400 font-semibold">{s.failed}</span> {t("ws.mkt.calendar.failed", lang)}</>}
                  </span>
                ); })()}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("ws.mkt.calendar.empty", lang)}</p>}
      </div>
    </div>
  );
}
