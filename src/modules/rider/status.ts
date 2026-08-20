// Rider service status — full booking+job lifecycle timeline per motorcycle.
import { db } from "@/lib/db";

export type LifecycleStep =
  | "book_requested" | "book_confirmed" | "checked_in" | "in_service"
  | "qc_check" | "ready" | "completed";

export const LIFECYCLE_STEPS: LifecycleStep[] = [
  "book_requested", "book_confirmed", "checked_in", "in_service", "qc_check", "ready", "completed",
];

export interface BikeStatus {
  bike: { id: string; brand: string; model: string; plate: string; year: number; currentMileage: number };
  booking: { id: string; serviceType: string; date: Date; timeSlot: string; status: string; source: string } | null;
  job: { id: string; jobNumber: string; status: string; packageName: string | null; readyAt: Date | null; completedAt: Date | null; mileage: number } | null;
  /** 0-based index into LIFECYCLE_STEPS; null when cancelled/no-show/completed-outside */
  stepIndex: number | null;
  /** terminal flag: cancelled / no-show / completed */
  outcome: "active" | "completed" | "cancelled" | "no_show" | "none";
  /** sub-status badge, e.g. waiting parts / on hold / approval needed */
  sub: { kind: "waiting_parts" | "on_hold" | "approval" | "none"; text?: string } | null;
}

/** Resolve lifecycle step from booking + job statuses. */
export function resolveStep(bookingStatus: string | null, jobStatus: string | null): { stepIndex: number | null; outcome: BikeStatus["outcome"] } {
  if (bookingStatus === "CANCELLED") return { stepIndex: null, outcome: "cancelled" };
  if (bookingStatus === "NO_SHOW") return { stepIndex: null, outcome: "no_show" };
  if (jobStatus === "COMPLETED" || bookingStatus === "COMPLETED") return { stepIndex: 6, outcome: "completed" };
  if (jobStatus === "CANCELLED") return { stepIndex: null, outcome: "cancelled" };
  switch (jobStatus ?? null) {
    case "WAITING": return { stepIndex: 2, outcome: "active" }; // checked in
    case "IN_PROGRESS":
    case "AWAITING_APPROVAL": return { stepIndex: 3, outcome: "active" };
    case "QC_CHECK": return { stepIndex: 4, outcome: "active" };
    case "WAITING_PARTS":
    case "ON_HOLD": return { stepIndex: 3, outcome: "active" }; // still in service, sub-badge
    case "READY": return { stepIndex: 5, outcome: "active" };
    case null: break;
  }
  // no job yet — derive from booking
  switch (bookingStatus ?? null) {
    case "REQUESTED": return { stepIndex: 0, outcome: "active" };
    case "CONFIRMED":
    case "RESCHEDULED": return { stepIndex: 1, outcome: "active" };
    case "CHECKED_IN": return { stepIndex: 2, outcome: "active" };
    default: return { stepIndex: null, outcome: "none" };
  }
}

/** Sub-status for badges (waiting parts / on hold / approval needed). */
export function subStatusOf(jobStatus: string | null, pendingApprovals: number): BikeStatus["sub"] {
  if (jobStatus === "WAITING_PARTS") return { kind: "waiting_parts" };
  if (jobStatus === "ON_HOLD") return { kind: "on_hold" };
  if (pendingApprovals > 0) return { kind: "approval", text: String(pendingApprovals) };
  return { kind: "none" };
}

/** Full per-motorcycle status feed for the rider. */
export async function getRiderStatus(customerId: string): Promise<BikeStatus[]> {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      motorcycles: { orderBy: { currentMileage: "desc" } },
      bookings: { include: { job: true }, orderBy: { date: "desc" } },
    },
  });
  if (!customer) return [];

  const out: BikeStatus[] = [];
  for (const bike of customer.motorcycles) {
    const booking = customer.bookings
      .filter((b) => b.motorcycleId === bike.id && b.status !== "COMPLETED" && b.status !== "CANCELLED" && b.status !== "NO_SHOW")
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    const activeBooking = booking;
    const job = booking?.job ??
      (await db.serviceJob.findFirst({
        where: { motorcycleId: bike.id, status: { in: ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "QC_CHECK", "WAITING_PARTS", "ON_HOLD", "READY"] } },
        orderBy: { createdAt: "desc" },
      }));
    const pendingApprovals = job ? await db.customerApproval.count({ where: { jobId: job.id, status: "PENDING" } }) : 0;
    const { stepIndex, outcome } = resolveStep(activeBooking?.status ?? null, job?.status ?? null);
    out.push({
      bike: { id: bike.id, brand: bike.brand, model: bike.model, plate: bike.plate, year: bike.year, currentMileage: bike.currentMileage },
      booking: activeBooking ? { id: activeBooking.id, serviceType: activeBooking.serviceType, date: activeBooking.date, timeSlot: activeBooking.timeSlot, status: activeBooking.status, source: activeBooking.source } : null,
      job: job ? { id: job.id, jobNumber: job.jobNumber, status: job.status, packageName: job.packageName, readyAt: job.readyAt, completedAt: job.completedAt, mileage: job.mileage } : null,
      stepIndex,
      outcome,
      sub: subStatusOf(job?.status ?? null, pendingApprovals),
    });
  }
  return out;
}
