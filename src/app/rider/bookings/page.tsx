import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getDemoCustomer } from "@/lib/demo-customer";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  REQUESTED: { label: "Waiting for confirmation", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  CONFIRMED: { label: "Confirmed", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  RESCHEDULED: { label: "Rescheduled", cls: "bg-purple-50 text-purple-700 ring-purple-200" },
  CHECKED_IN: { label: "Checked in", cls: "bg-cyan-50 text-cyan-700 ring-cyan-200" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-600 ring-red-200" },
};

export default async function RiderBookingsPage() {
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const bookings = await db.booking.findMany({
    where: { customerId: customer.id },
    include: { motorcycle: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      {bookings.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No bookings yet.</p>}
      <div className="space-y-3">
        {bookings.map((b) => {
          const s = STATUS_LABEL[b.status] ?? { label: b.status, cls: "" };
          return (
            <div key={b.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{b.serviceType}</span>
                <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 " + s.cls}>{s.label}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {fmtDate(b.date)} · {b.timeSlot} · {b.motorcycle.brand} {b.motorcycle.model}
              </div>
              {b.notes && <p className="mt-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5">“{b.notes}”</p>}
              {b.jobId && <Link href="/rider/service-status" className="mt-2 inline-block text-xs font-semibold text-primary">View live status →</Link>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
