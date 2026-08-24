import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getDemoCustomer } from "@/lib/demo-customer";
import { PageTransition } from "@/components/shared/page-transition";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { key: string; cls: string; stripe: string }> = {
  REQUESTED: { key: "book.REQUESTED", cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900", stripe: "border-l-amber-400" },
  CONFIRMED: { key: "book.CONFIRMED", cls: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900", stripe: "border-l-blue-400" },
  RESCHEDULED: { key: "book.RESCHEDULED", cls: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-900", stripe: "border-l-purple-400" },
  CHECKED_IN: { key: "book.CHECKED_IN", cls: "bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:ring-cyan-900", stripe: "border-l-cyan-400" },
  COMPLETED: { key: "book.COMPLETED", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900", stripe: "border-l-emerald-400" },
  CANCELLED: { key: "book.CANCELLED", cls: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900", stripe: "border-l-red-400" },
  NO_SHOW: { key: "book.NO_SHOW", cls: "bg-slate-100 text-slate-600 dark:text-slate-300 ring-slate-300", stripe: "border-l-slate-300" },
};

export default async function RiderBookingsPage() {
  const lang = await getLang();
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const bookings = await db.booking.findMany({
    where: { customerId: customer.id },
    include: { motorcycle: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <PageTransition>
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("rider.my-bookings", lang)}</h1>
      {bookings.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("rider.no-bookings", lang)}</p>}
      <div className="space-y-3">
        {bookings.map((b) => {
          const s = STATUS_LABEL[b.status] ?? null;
          return (
            <div key={b.id} className={"rounded-2xl border bg-card p-4 border-l-4 " + (s?.stripe ?? "border-l-border")}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{b.serviceType}</span>
                <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 " + (s?.cls ?? "")}>{s ? t(s.key, lang) : b.status}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {fmtDate(b.date)} · {b.timeSlot} · {b.motorcycle.brand} {b.motorcycle.model}
              </div>
              {b.notes && <p className="mt-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5">“{b.notes}”</p>}
              {b.jobId && <Link href="/rider/service-status" className="mt-2 inline-block text-xs font-semibold text-primary">{t("rider.view-live-status", lang)}</Link>}
            </div>
          );
        })}
      </div>
    </div>
    </PageTransition>
  );
}
