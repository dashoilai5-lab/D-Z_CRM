import { getDemoCustomer } from "@/lib/demo-customer";
import { db } from "@/lib/db";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServiceStatusPage() {
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const bike = [...customer.motorcycles].sort((a, b) => b.currentMileage - a.currentMileage)[0];
  const job = bike
    ? await db.serviceJob.findFirst({
        where: { motorcycleId: bike.id, status: { in: ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY"] } },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (!job) {
    return (
      <div className="text-center py-14 space-y-3">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground text-2xl">🔧</div>
        <h1 className="text-lg font-semibold">No active service</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">Your motorcycle is not being serviced right now. Book a service to see live status here.</p>
      </div>
    );
  }

  const steps = [
    { key: "checked", label: "Checked In", done: job.status !== "WAITING" },
    { key: "inspection", label: "Inspection Complete", done: ["IN_PROGRESS", "AWAITING_APPROVAL", "READY"].includes(job.status) },
    { key: "service", label: "Service In Progress", active: job.status === "IN_PROGRESS" || job.status === "AWAITING_APPROVAL", done: job.status === "READY" },
    { key: "final", label: "Final Inspection", active: job.status === "READY", done: false },
    { key: "ready", label: "Ready for Collection", active: false, done: false },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">
        {job.status === "READY" ? "YOUR MOTORCYCLE IS READY" : "YOUR MOTORCYCLE IS BEING SERVICED"}
      </h1>
      <div className="rounded-3xl border bg-card p-5">
        <div className="font-semibold">{bike?.brand} {bike?.model}</div>
        <div className="text-sm text-muted-foreground">{bike?.plate} · Job {job.jobNumber}</div>
        {job.packageName && <div className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{job.packageName}</div>}
        <div className="mt-5 space-y-0">
          {steps.map((s, i) => (
            <div key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                {s.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  : s.active ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  : <Circle className="h-5 w-5 text-slate-300" />}
                {i < steps.length - 1 && <div className={"w-0.5 flex-1 my-1 " + (s.done ? "bg-emerald-500" : "bg-slate-200")} />}
              </div>
              <div className={"pb-6 text-sm " + (s.done ? "font-medium" : s.active ? "font-semibold text-primary" : "text-muted-foreground")}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      {job.status === "AWAITING_APPROVAL" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <strong>We need your approval.</strong> The mechanic found additional work needed. Check the Approvals tab.
        </div>
      )}
    </div>
  );
}
