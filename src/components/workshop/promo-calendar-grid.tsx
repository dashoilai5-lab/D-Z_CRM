"use client";

import { useMemo, useState } from "react";
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format, isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

const TYPE_DOT: Record<string, string> = {
  PROMO: "bg-purple-500",
  RETURN: "bg-emerald-500",
  REMINDER: "bg-blue-500",
  NEWS: "bg-amber-500",
};
const TYPE_LABEL: Record<string, string> = { PROMO: "Promo", RETURN: "Return", REMINDER: "Reminder", NEWS: "News" };

/** Lightweight month calendar: campaigns appear as colored dots on their date span. */
export function PromoCalendarGrid({ campaigns }: { campaigns: CalendarCampaign[] }) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  // a campaign's span in this month (dot per day it covers)
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarCampaign[]>();
    for (const c of campaigns) {
      const start = c.startDate;
      const end = c.endDate ?? start;
      // iterate days in this month window
      let d = new Date(start.getTime());
      d.setHours(12, 0, 0, 0);
      const last = new Date(end.getTime());
      last.setHours(12, 0, 0, 0);
      for (let i = 0; i < 62; i++) {
        if (d > last) break;
        const key = format(d, "yyyy-MM-dd");
        const arr = map.get(key) ?? [];
        if (!arr.some((x) => x.id === c.id)) arr.push(c);
        map.set(key, arr);
        d = new Date(d.getTime() + 86400000);
      }
    }
    return map;
  }, [campaigns]);

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedCampaigns = selectedKey ? (byDay.get(selectedKey) ?? []) : [];

  return (
    <div className="rounded-2xl border bg-card p-4">
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(subMonths(cursor, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-muted" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-muted" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="font-semibold text-sm ml-1">{format(cursor, "MMMM yyyy")}</div>
        </div>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          {(["PROMO", "RETURN", "REMINDER", "NEWS"] as const).map((t) => (
            <span key={t} className="inline-flex items-center gap-1"><span className={"h-2 w-2 rounded-full " + TYPE_DOT[t]} />{TYPE_LABEL[t]}</span>
          ))}
        </div>
      </div>

      {/* weekday headers */}
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-muted-foreground mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const items = byDay.get(key) ?? [];
          const inMonth = isSameMonth(d, cursor);
          const today = isToday(d);
          const sel = selected && isSameDay(d, selected);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(sel ? null : d)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors",
                inMonth ? "hover:bg-muted/60" : "text-muted-foreground/30 hover:bg-muted/30",
                today && "ring-1 ring-primary",
                sel && "bg-primary/10 ring-1 ring-primary/40"
              )}
            >
              <span className={cn("font-medium", sel && "text-primary")}>{format(d, "d")}</span>
              {items.length > 0 && (
                <span className="mt-0.5 flex gap-0.5">
                  {items.slice(0, 3).map((c) => <span key={c.id} className={"h-1.5 w-1.5 rounded-full " + (TYPE_DOT[c.type] ?? "bg-slate-400")} />)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* selected day details */}
      {selectedCampaigns.length > 0 && (
        <div className="mt-3 rounded-xl border bg-muted/30 p-3 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {selected ? format(selected, "EEE, d MMM yyyy") : ""} · {selectedCampaigns.length} activit{selectedCampaigns.length > 1 ? "ies" : "y"}
          </div>
          {selectedCampaigns.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              <span className={"h-2 w-2 rounded-full shrink-0 " + (TYPE_DOT[c.type] ?? "bg-slate-400")} />
              <span className="flex-1 truncate font-medium">{c.name}</span>
              {c.discountPercent && <span className="text-xs font-bold text-purple-600">−{c.discountPercent}%</span>}
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : c.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" : c.status === "DRAFT" ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-400")}>{c.status}</span>
              {c.conversions > 0 && <span className="text-[10px] text-emerald-600 font-semibold">{c.conversions} bookings</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
