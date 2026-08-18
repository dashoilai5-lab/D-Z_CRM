// Deterministic service prediction (§29, §71) — pure functions, unit-testable.
import { DEFAULT_SERVICE_INTERVAL_KM, AVG_KM_PER_MONTH } from "@/lib/constants";

export function calculateNextServiceMileage(lastServiceMileage: number, intervalKm = DEFAULT_SERVICE_INTERVAL_KM): number {
  return lastServiceMileage + intervalKm;
}

export function calculateNextServiceDate(lastServiceDate: Date, intervalKm = DEFAULT_SERVICE_INTERVAL_KM, avgKmPerMonth = AVG_KM_PER_MONTH): Date {
  const months = intervalKm / avgKmPerMonth;
  return new Date(lastServiceDate.getTime() + months * 30 * 86400000);
}

/** §37: reorder_point = avg_daily_usage × lead_time + safety_stock */
export function calculateReorderPoint(avgDailyUsage: number, leadTimeDays: number, safetyStock: number): number {
  return Math.ceil(avgDailyUsage * leadTimeDays + safetyStock);
}
