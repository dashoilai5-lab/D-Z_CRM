"use client";

import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import { useLang } from "@/components/shared/language-context";

const DARK = " dark:bg-slate-900/70 dark:text-slate-300 dark:border-slate-800";
const JOB_STYLES: Record<string, { key: string; cls: string }> = {
  WAITING: { key: "status.WAITING", cls: "bg-slate-100 text-slate-700 border-slate-200" + DARK },
  IN_PROGRESS: { key: "status.IN_PROGRESS", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900" },
  AWAITING_APPROVAL: { key: "status.AWAITING_APPROVAL", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900" },
  QC_CHECK: { key: "status.QC_CHECK", cls: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900" },
  WAITING_PARTS: { key: "status.WAITING_PARTS", cls: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900" },
  ON_HOLD: { key: "status.ON_HOLD", cls: "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  READY: { key: "status.READY", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900" },
  COMPLETED: { key: "status.COMPLETED", cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900" },
  CANCELLED: { key: "status.CANCELLED", cls: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900" },
};

const BOOKING_STYLES: Record<string, { key: string; cls: string }> = {
  REQUESTED: { key: "book.REQUESTED", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900" },
  CONFIRMED: { key: "book.CONFIRMED", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900" },
  RESCHEDULED: { key: "book.RESCHEDULED", cls: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900" },
  CHECKED_IN: { key: "book.CHECKED_IN", cls: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900" },
  COMPLETED: { key: "book.COMPLETED", cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900" },
  CANCELLED: { key: "book.CANCELLED", cls: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900" },
  NO_SHOW: { key: "book.NO_SHOW", cls: "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
};

const REMINDER_STYLES: Record<string, { key: string; cls: string }> = {
  UPCOMING: { key: "rem.UPCOMING", cls: "bg-slate-100 text-slate-700 border-slate-200" + DARK },
  DUE_SOON: { key: "rem.DUE_SOON", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900" },
  DUE: { key: "rem.DUE", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900" },
  OVERDUE: { key: "rem.OVERDUE", cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900" },
  BOOKED: { key: "rem.BOOKED", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900" },
  COMPLETED: { key: "rem.COMPLETED", cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900" },
};

export function StatusBadge({ kind, value }: { kind: "job" | "booking" | "reminder"; value: string }) {
  const lang = useLang();
  const map = kind === "job" ? JOB_STYLES : kind === "booking" ? BOOKING_STYLES : REMINDER_STYLES;
  const s = map[value] ?? { key: "common.status", cls: "bg-slate-100 text-slate-700 border-slate-200" };
  return <Badge variant="outline" className={"whitespace-nowrap font-medium " + s.cls}>{t(s.key, lang)}</Badge>;
}
