// Shared domain types. Enums are mirrored from the Prisma schema for use in
// client components without importing the Prisma client.

export const Role = ["SUPER_ADMIN", "OWNER", "MANAGER", "COUNTER_STAFF", "SERVICE_ADVISOR", "MECHANIC", "INVENTORY", "MARKETING", "ACCOUNTING"] as const;
export type Role = (typeof Role)[number];

export const BookingStatus = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"] as const;
export type BookingStatus = (typeof BookingStatus)[number];

export const JobStatus = ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY", "COMPLETED", "CANCELLED"] as const;
export type JobStatus = (typeof JobStatus)[number];

export const ItemStatus = ["INCLUDED", "RECOMMENDED", "ACCEPTED", "DECLINED"] as const;
export type ItemStatus = (typeof ItemStatus)[number];

export const CheckResult = ["PASS", "WARNING", "FAIL", "NA"] as const;
export type CheckResult = (typeof CheckResult)[number];

export const FindingStatus = ["OPEN", "RECOMMENDED", "APPROVED", "DECLINED", "RESOLVED"] as const;
export type FindingStatus = (typeof FindingStatus)[number];

export const ApprovalStatus = ["PENDING", "APPROVED", "DECLINED"] as const;
export type ApprovalStatus = (typeof ApprovalStatus)[number];

export const PackageTier = ["GOOD", "BETTER", "BEST"] as const;
export type PackageTier = (typeof PackageTier)[number];

export const ReminderStatus = ["UPCOMING", "DUE_SOON", "DUE", "OVERDUE", "BOOKED", "COMPLETED"] as const;
export type ReminderStatus = (typeof ReminderStatus)[number];

export const InvoiceStatus = ["DRAFT", "ISSUED", "PAID"] as const;
export type InvoiceStatus = (typeof InvoiceStatus)[number];

export type StockLevel = "HEALTHY" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";

// ---------- Read-model DTOs (what the UI renders) ----------

export interface JobSummary {
  id: string;
  jobNumber: string;
  status: (typeof JobStatus)[number];
  mileage: number;
  packageName: string | null;
  customerRequest: string | null;
  customer: { id: string; name: string; phone: string | null };
  motorcycle: { brand: string; model: string; plate: string; year: number };
  mechanic: { id: string; name: string } | null;
  createdAt: Date;
  startedAt: Date | null;
  readyAt: Date | null;
  completedAt: Date | null;
  totalSen: number;
  pendingApprovals: number;
}

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string | null;
  joinedAt: Date;
  motorcycles: { id: string; brand: string; model: string; plate: string; year: number; currentMileage: number }[];
  lifetimeSpendSen: number;
  visits: number;
  lastVisitAt: Date | null;
  daysSinceVisit: number | null;
  dueStatus: "DUE" | "DUE_SOON" | "UPCOMING" | "NONE" | "BOOKED";
  nextServiceMileage: number | null;
}

export interface KpiStaff {
  id: string;
  name: string;
  role: string;
  jobs: number;
  salesSen: number;
  avgTicketSen: number;
  packageConversion: number; // 0-100
  addonConversion: number; // 0-100
  checklistCompletion: number; // 0-100
  rating: number; // 0-5
  score: number; // 0-100
}

export interface StockStatus {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  level: StockLevel;
  daysRemaining: number | null;
  daysSinceLastSale: number | null;
  valueSen: number;
  recommendedReorderQty: number;
  reason: string | null;
  supplierId: string | null;
  leadTimeDays: number;
}
