import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { bookingService } from "@/modules/bookings/service";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/shared/status-badge";
import { BookingActions } from "@/components/workshop/booking-actions";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const [bookings, packages] = await Promise.all([
    bookingService.list(),
    db.servicePackage.findMany({ where: { active: true }, select: { id: true, name: true, priceSen: true, isBestValue: true }, orderBy: { priceSen: "asc" } }),
  ]);
  const order = { REQUESTED: 0, CONFIRMED: 1, RESCHEDULED: 2, CHECKED_IN: 3, COMPLETED: 4, CANCELLED: 5 } as const;
  const sorted = [...bookings].sort((a, b) => (order[a.status as keyof typeof order] ?? 9) - (order[b.status as keyof typeof order] ?? 9) || a.date.getTime() - b.date.getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Bookings</h1>
      <p className="text-sm text-muted-foreground mb-6">Rider App requests and counter bookings — one shared calendar.</p>

      <div className="space-y-2">
        {sorted.map((b) => (
          <div key={b.id} data-testid="booking-row" className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="min-w-40 flex-1">
              <div className="font-medium text-sm">{b.customer.name}</div>
              <div className="text-xs text-muted-foreground">{b.motorcycle.brand} {b.motorcycle.model} · {b.motorcycle.plate}</div>
            </div>
            <div className="min-w-32">
              <div className="text-sm font-medium">{b.serviceType}</div>
              <div className="text-xs text-muted-foreground">{fmtDate(b.date)} · {b.timeSlot}</div>
            </div>
            <div className="text-[11px] uppercase text-muted-foreground">{b.source === "RIDER_APP" ? "Rider App" : b.source}</div>
            <StatusBadge kind="booking" value={b.status} />
            {b.job && <Link href={"/workshop/jobs/" + b.job.id} className="text-xs font-mono text-primary hover:underline">{b.job.jobNumber}</Link>}
            <BookingActions bookingId={b.id} status={b.status} packages={packages} />
          </div>
        ))}
      </div>
    </div>
  );
}
