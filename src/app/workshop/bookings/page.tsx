import Link from "next/link";
import { CalendarClock, CalendarDays, List } from "lucide-react";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageTransition } from "@/components/shared/page-transition";
import { BookingActions } from "@/components/workshop/booking-actions";
import { fmtDate } from "@/lib/format";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ branch?: string; date?: string; view?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const branches = await db.branch.findMany({ where: { organisationId: org!.id } });
  const where: Record<string, unknown> = {};
  if (sp.branch) where.branchId = sp.branch;
  if (sp.date) {
    const d = new Date(sp.date + "T00:00:00");
    const next = new Date(d.getTime() + 86400000);
    where.date = { gte: d, lt: next };
  }
  const [bookings, packages] = await Promise.all([
    db.booking.findMany({
      where,
      include: { customer: { select: { id: true, name: true, phone: true } }, motorcycle: { select: { brand: true, model: true, plate: true } }, branch: { select: { id: true, city: true } }, job: { select: { id: true, jobNumber: true, status: true } } },
      orderBy: { date: "asc" },
    }),
    db.servicePackage.findMany({ where: { active: true }, select: { id: true, name: true, priceSen: true, isBestValue: true }, orderBy: { priceSen: "asc" } }),
  ]);
  const order: Record<string, number> = { REQUESTED: 0, CONFIRMED: 1, RESCHEDULED: 2, CHECKED_IN: 3, COMPLETED: 4, CANCELLED: 5, NO_SHOW: 6 };
  const sorted = [...bookings].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.date.getTime() - b.date.getTime());

  // month calendar (BOOK-026/027/028): counts per day for the displayed month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = first.getDay();
  const monthBookings = await db.booking.findMany({
    where: { branchId: sp.branch || undefined, date: { gte: first, lt: new Date(year, month + 1, 1) } },
    select: { date: true },
  });
  const counts = new Map<string, number>();
  for (const b of monthBookings) {
    const key = b.date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const view = sp.view ?? "list";

  return (
    <PageTransition>
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("ws.bookings.title", lang)}</h1>
        <Link href="/workshop/bookings/slots" className="text-sm text-primary hover:underline">Manage appointment slots →</Link>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("ws.bookings.subtitle", lang)} · {bookings.length} shown</p>

      <form method="get" className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <select name="branch" defaultValue={sp.branch} className="rounded-md border bg-background px-3 py-2">
          <option value="">All branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.city}</option>)}
        </select>
        <input name="date" type="date" defaultValue={sp.date} className="rounded-md border bg-background px-3 py-2" />
        <button className="rounded-md border px-3 py-2 font-medium">Filter</button>
        <div className="flex-1" />
        <a href={"/workshop/bookings?view=list" + (sp.branch ? "&branch=" + sp.branch : "") + (sp.date ? "&date=" + sp.date : "")} className={"inline-flex items-center gap-1 rounded-md border px-3 py-2 " + (view === "list" ? "bg-primary text-primary-foreground" : "")}><List className="h-3.5 w-3.5" />List</a>
        <a href={"/workshop/bookings?view=calendar" + (sp.branch ? "&branch=" + sp.branch : "")} className={"inline-flex items-center gap-1 rounded-md border px-3 py-2 " + (view === "calendar" ? "bg-primary text-primary-foreground" : "")}><CalendarDays className="h-3.5 w-3.5" />Month</a>
      </form>

      {view === "calendar" ? (
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold text-sm mb-3">{year}-{String(month + 1).padStart(2, "0")} — bookings per day</h2>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>)}
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={"e" + i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
              const count = counts.get(key) ?? 0;
              const isToday = day === now.getDate();
              return (
                <Link
                  key={key}
                  href={"/workshop/bookings?date=" + key + "&view=list" + (sp.branch ? "&branch=" + sp.branch : "")}
                  className={"rounded-lg border p-2 min-h-[52px] hover:bg-accent transition-colors " + (isToday ? "border-primary" : "")}
                >
                  <div className="text-xs font-medium">{day}</div>
                  {count > 0 && <div className={"mt-1 text-[10px] font-semibold " + (count >= 4 ? "text-destructive" : "text-primary")}>{count} booking{count > 1 ? "s" : ""}</div>}
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((b) => {
            const stripe = {
              REQUESTED: "border-l-amber-400", CONFIRMED: "border-l-blue-400", RESCHEDULED: "border-l-purple-400",
              CHECKED_IN: "border-l-cyan-400", COMPLETED: "border-l-emerald-400", CANCELLED: "border-l-red-400", NO_SHOW: "border-l-slate-300",
            }[b.status] ?? "border-l-border";
            return (
            <div key={b.id} data-testid="booking-row" className={"flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 border-l-4 transition-colors hover:border-l-primary " + stripe}>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="min-w-40 flex-1">
                <div className="font-medium text-sm">{b.customer.name}</div>
                <div className="text-xs text-muted-foreground">{b.motorcycle.brand} {b.motorcycle.model} · {b.motorcycle.plate}</div>
              </div>
              <div className="min-w-32">
                <div className="text-sm font-medium">{b.serviceType}</div>
                <div className="text-xs text-muted-foreground">{fmtDate(b.date)} · {b.timeSlot} · {b.branch.city}</div>
              </div>
              <div className="text-[11px] uppercase text-muted-foreground">{b.source === "RIDER_APP" ? t("ws.bookings.source-rider", lang) : b.source}</div>
              <StatusBadge kind="booking" value={b.status} />
              {b.job && <Link href={"/workshop/jobs/" + b.job.id} className="text-xs font-mono text-primary hover:underline">{b.job.jobNumber}</Link>}
              <BookingActions bookingId={b.id} status={b.status} packages={packages} />
            </div>
            );
          })}
          {sorted.length === 0 && <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">No bookings match.</div>}
        </div>
      )}
    </div>
    </PageTransition>
  );
}
