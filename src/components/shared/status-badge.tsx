import { Badge } from "@/components/ui/badge";

const JOB_STYLES: Record<string, { label: string; cls: string }> = {
  WAITING: { label: "Waiting", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  AWAITING_APPROVAL: { label: "Awaiting Approval", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  READY: { label: "Ready", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-600 border-red-200" },
};

const BOOKING_STYLES: Record<string, { label: string; cls: string }> = {
  REQUESTED: { label: "Requested", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmed", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  RESCHEDULED: { label: "Rescheduled", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  CHECKED_IN: { label: "Checked In", cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-600 border-red-200" },
};

const REMINDER_STYLES: Record<string, { label: string; cls: string }> = {
  UPCOMING: { label: "Upcoming", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  DUE_SOON: { label: "Due Soon", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  DUE: { label: "Due", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  OVERDUE: { label: "Overdue", cls: "bg-red-50 text-red-700 border-red-200" },
  BOOKED: { label: "Booked", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

export function StatusBadge({ kind, value }: { kind: "job" | "booking" | "reminder"; value: string }) {
  const map = kind === "job" ? JOB_STYLES : kind === "booking" ? BOOKING_STYLES : REMINDER_STYLES;
  const s = map[value] ?? { label: value, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  return <Badge variant="outline" className={"whitespace-nowrap font-medium " + s.cls}>{s.label}</Badge>;
}
