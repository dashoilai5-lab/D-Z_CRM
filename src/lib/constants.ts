// D&Z demo constants — the seed and the runtime demo are anchored to these.
export const ORG_NAME = "D&Z Smart Workshop";

export const BRANCHES = [
  { name: "D&Z Smart Workshop", city: "Kuala Lumpur", isMain: true },
  { name: "D&Z Smart Workshop", city: "Shah Alam", isMain: false },
  { name: "D&Z Smart Workshop", city: "Johor Bahru", isMain: false },
] as const;

/** Standard service interval used for deterministic next-service prediction. */
export const DEFAULT_SERVICE_INTERVAL_KM = 3000;
/** Rough average riding pace used to estimate the next-service date. */
export const AVG_KM_PER_MONTH = 1000;

export const JOB_STATUS_ORDER = ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY", "COMPLETED", "CANCELLED"] as const;

export const BOOKING_STATUS_ORDER = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"] as const;
