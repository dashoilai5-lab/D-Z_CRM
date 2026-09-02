"use client";

import { useMemo, useState } from "react";
import {
  addMonths, subMonths, addDays, subDays, addWeeks, subWeeks,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear,
  eachDayOfInterval, eachWeekOfInterval, isSameMonth, isSameDay, format, isToday, isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export interface CalendarCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  discountPercent: number | null;
  conversions: number;
}

const TYPE_BAR: Record<string, string> = {
  PROMO: "bg-purple-500",
  RETURN: "bg-emerald-500",
  REMINDER: "bg-blue-500",
  NEWS: "bg-amber-500",
};
const STATUS_TONE: Record<string, string> = {
  ACTIVE: "text-emerald-600 dark:text-emerald-300", SCHEDULED: "text-blue-600 dark:text-blue-300", DRAFT: "text-slate-400", ENDED: "text-slate-400 line-through",
};
type View = "week" | "month" | "year";

function campaignOnDay(c: CalendarCampaign, d: Date): boolean {
  const end = c.endDate ?? c.startDate;
  return isWithinInterval(d, { start: c.startDate, end });
}

/** Compact campaign chip shown inside calendar cells. */
function CampaignChip({ c, mini }: { c: CalendarCampaign; mini?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1 min-w-0", mini ? "" : "mt-0.5")} title={c.name + (c.discountPercent ? " (-" + c.discountPercent + "%)" : "")}>
      <span className={cn("shrink-0 rounded-full", TYPE_BAR[c.type] ?? "bg-slate-400", mini ? "h-1 w-1" : "h-1.5 w-1.5")} />
      <span className={cn("truncate font-medium leading-tight", STATUS_TONE[c.status] ?? "", mini ? "text-[9px]" : "text-[10px]")}>{c.name}</span>
    </div>
  );
}

export function PromoCalendarGrid({ campaigns }: { campaigns: CalendarCampaign[] }) {
  const lang = useLang();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const days = useMemo(() => {
    if (view === "week") return eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) });
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [view, cursor]);

  const monthGrid = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weeksOfMonth = useMemo(() => eachWeekOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) }, { weekStartsOn: 1 }), [cursor]);
  const monthsOfYear = useMemo(() => {
    const y = startOfYear(cursor);
    return Array.from({ length: 12 }, (_, i) => addMonths(y, i));
  }, [cursor]);

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedCampaigns = selectedKey ? campaigns.filter((c) => {
    const d = selected!;
    return campaignOnDay(c, d);
  }) : [];

  const nav = (dir: 1 | -1) => {
    setCursor((c) => {
      if (view === "week") return dir === 1 ? addWeeks(c, 1) : subWeeks(c, 1);
      if (view === "month") return dir === 1 ? addMonths(c, 1) : subMonths(c, 1);
      return dir === 1 ? addMonths(c, 12) : subMonths(c, 12);
    });
    setSelected(null);
  };

  const title =
    view === "week" ? t("promo-cal.week-of", lang) + " " + format(cursor, "d MMM yyyy")
    : view === "month" ? format(cursor, "MMMM yyyy")
    : format(cursor, "yyyy");

  return (
    <div className="rounded-2xl border bg-card p-3">
      {/* header: view switcher + nav */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <button onClick={() => nav(-1)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted" aria-label={t("promo-cal.prev", lang)}><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={() => nav(1)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted" aria-label={t("promo-cal.next", lang)}><ChevronRight className="h-3.5 w-3.5" /></button>
          <div className="font-semibold text-sm ml-1">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            {(["week", "month", "year"] as View[]).map((v) => (
              <button key={v} onClick={() => { setView(v); setSelected(null); }} className={cn("rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {t("promo-cal.view." + v, lang)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 text-[9px] text-muted-foreground">
            {(["PROMO", "RETURN", "REMINDER", "NEWS"] as const).map((ty) => (
              <span key={ty} className="inline-flex items-center gap-0.5"><span className={"h-1.5 w-1.5 rounded-full " + TYPE_BAR[ty]} />{t("ws.mkt.calendar.type." + ty, lang)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* WEEK view */}
      {view === "week" && (
        <div className="space-y-0.5">
          {days.map((d) => {
            const items = campaigns.filter((c) => campaignOnDay(c, d));
            const today = isToday(d);
            return (
              <button key={d.toISOString()} onClick={() => setSelected(isSameDay(selected ?? new Date(0), d) ? null : d)} className={cn("flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors w-full", today ? "bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/50")}>
                <span className={cn("w-10 shrink-0 text-[10px] font-semibold", today ? "text-primary" : "text-muted-foreground")}>{format(d, "EEE d")}</span>
                <span className="flex flex-1 flex-wrap gap-x-2 gap-y-0.5 min-w-0">
                  {items.length === 0 ? <span className="text-[10px] text-muted-foreground/50">—</span> : items.map((c) => <CampaignChip key={c.id} c={c} mini />)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* MONTH view */}
      {view === "month" && (
        <>
          <div className="grid grid-cols-7 text-center text-[9px] font-semibold uppercase text-muted-foreground mb-0.5">
            {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((d) => <div key={d}>{t("promo-cal.day." + d, lang)}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden">
            {monthGrid.map((d) => {
              const items = campaigns.filter((c) => campaignOnDay(c, d));
              const inMonth = isSameMonth(d, cursor);
              const today = isToday(d);
              const sel = selected && isSameDay(d, selected);
              return (
                <button key={d.toISOString()} onClick={() => setSelected(sel ? null : d)} className={cn("min-h-[52px] bg-card p-1 text-left align-top transition-colors", inMonth ? "hover:bg-muted/40" : "bg-muted/30 hover:bg-muted/50", today && "ring-1 ring-inset ring-primary/40", sel && "bg-primary/10")}>
                  <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-medium", today ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/40", sel && "bg-primary text-primary-foreground")}>{format(d, "d")}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {items.slice(0, 2).map((c) => <CampaignChip key={c.id} c={c} mini />)}
                    {items.length > 2 && <div className="text-[8px] text-muted-foreground">{"+" + (items.length - 2) + " " + t("promo-cal.more", lang)}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* YEAR view */}
      {view === "year" && (
        <div className="grid grid-cols-4 gap-2">
          {monthsOfYear.map((m) => {
            const inMonth = campaigns.filter((c) => {
              const end = c.endDate ?? c.startDate;
              return !(end < startOfMonth(m) || c.startDate > endOfMonth(m));
            });
            const isCurrent = isSameMonth(m, cursor);
            return (
              <div key={m.toISOString()} onClick={() => { setCursor(m); setView("month"); setSelected(null); }} className={cn("rounded-lg border p-1.5 cursor-pointer transition-colors", isCurrent ? "border-primary/50 bg-primary/5" : "hover:bg-muted/40")}>
                <div className="text-[10px] font-semibold text-muted-foreground">{format(m, "MMM")}</div>
                <div className="mt-0.5 space-y-0.5">
                  {inMonth.length === 0 ? <div className="text-[9px] text-muted-foreground/40">—</div> : inMonth.slice(0, 2).map((c) => <CampaignChip key={c.id} c={c} mini />)}
                  {inMonth.length > 2 && <div className="text-[8px] text-muted-foreground">+{inMonth.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* selected day details */}
      {selectedCampaigns.length > 0 && (
        <div className="mt-2 rounded-lg border bg-muted/30 p-2.5 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{selected ? format(selected, "EEE, d MMM yyyy") : ""} · {selectedCampaigns.length} {t(selectedCampaigns.length > 1 ? "promo-cal.activities" : "promo-cal.activity", lang)}</div>
          {selectedCampaigns.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs">
              <span className={"h-1.5 w-1.5 rounded-full shrink-0 " + (TYPE_BAR[c.type] ?? "bg-slate-400")} />
              <span className="flex-1 truncate font-medium">{c.name}</span>
              {c.discountPercent && <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300">−{c.discountPercent}%</span>}
              <span className="text-[9px] font-semibold capitalize text-muted-foreground">{t("ws.mkt.status." + c.status, lang)}</span>
              {c.conversions > 0 && <span className="text-[9px] text-emerald-600 dark:text-emerald-300 font-semibold">{c.conversions} {t("dash.unit-bookings", lang)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
