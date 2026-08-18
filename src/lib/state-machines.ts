// Pure, deterministic business rules — unit-testable without a database (§68).

export type JobStatus = "WAITING" | "IN_PROGRESS" | "AWAITING_APPROVAL" | "READY" | "COMPLETED" | "CANCELLED";
export type BookingStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";
export type StockLevel = "HEALTHY" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";

/** §21 job transitions. */
export const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  WAITING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["AWAITING_APPROVAL", "READY", "CANCELLED"],
  AWAITING_APPROVAL: ["IN_PROGRESS", "READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionJob(from: JobStatus, to: JobStatus): boolean {
  return JOB_TRANSITIONS[from]?.includes(to) ?? false;
}

/** §20 booking transitions. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["CONFIRMED", "RESCHEDULED", "CANCELLED"],
  CONFIRMED: ["RESCHEDULED", "CHECKED_IN", "CANCELLED"],
  RESCHEDULED: ["CONFIRMED", "CHECKED_IN", "CANCELLED"],
  CHECKED_IN: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from]?.includes(to) ?? false;
}

/** §35 stock level from quantity vs minimum stock. */
export function stockLevel(quantity: number, minStock: number): StockLevel {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity <= Math.ceil(minStock * 0.5)) return "CRITICAL";
  if (quantity <= minStock) return "LOW";
  return "HEALTHY";
}

/** §33 KPI score (0-100) — deterministic and explainable. */
export function calculateKpiScore(input: {
  jobs: number;
  avgTicketSen: number;
  packageConversion: number; // 0-100
  addonConversion: number; // 0-100
  checklistCompletion: number; // 0-100
  rating: number; // 0-5
  jobsFullScore?: number; // jobs needed for full marks (default 15)
  ticketTargetSen?: number; // ticket for full marks (default RM150)
}): number {
  const jobsNorm = Math.min(100, (input.jobs / (input.jobsFullScore ?? 15)) * 100);
  const ticketNorm = Math.min(100, (input.avgTicketSen / (input.ticketTargetSen ?? 15000)) * 100);
  const ratingNorm = (input.rating / 5) * 100;
  return Math.round(
    0.3 * jobsNorm +
      0.2 * ticketNorm +
      0.15 * input.packageConversion +
      0.15 * input.addonConversion +
      0.1 * input.checklistCompletion +
      0.1 * ratingNorm
  );
}
