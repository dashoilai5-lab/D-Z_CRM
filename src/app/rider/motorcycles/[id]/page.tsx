import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarPlus, ShieldCheck, Droplets, Filter, Link2 } from "lucide-react";
import { motorcycleService } from "@/modules/motorcycles/service";
import { db } from "@/lib/db";
import { fmtKM, fmtDate } from "@/lib/format";
import { formatRM } from "@/lib/money";
import { motorcycleTypeInfo } from "@/lib/motorcycle-types";
import { EditMotorcycle } from "@/components/rider/edit-motorcycle";

/** Consumable wear: 0-100 progress from last replacement to the recommended interval. */
function wearProgress(currentKm: number, lastKm: number | null, intervalKm: number): number {
  if (lastKm == null) return 0;
  const used = currentKm - lastKm;
  return Math.min(100, Math.max(0, Math.round((used / intervalKm) * 100)));
}
function kmUsed(currentKm: number, lastKm: number | null): number | null {
  return lastKm == null ? null : Math.max(0, currentKm - lastKm);
}

export const dynamic = "force-dynamic";

export default async function MotorcyclePassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const passport = await motorcycleService.getPassport(id);
  if (!passport) notFound();
  const jobs = await db.serviceJob.findMany({
    where: { motorcycleId: id, status: "COMPLETED" },
    include: { invoice: true, items: true, parts: { include: { product: true } }, mechanic: true },
    orderBy: { completedAt: "desc" },
  });
  const verified = jobs.length;
  const lifetime = jobs.reduce((s, j) => s + (j.invoice?.totalSen ?? 0), 0);

  // inspection findings across this bike's jobs (WARNING/FAIL history)
  const findings = await db.inspectionFinding.findMany({
    where: { job: { motorcycleId: id } },
    include: { job: { select: { jobNumber: true, completedAt: true } }, approval: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-4">
      <Link href="/rider/motorcycles" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" /> My Motorcycles</Link>

      <div className="rounded-3xl border bg-card p-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><ShieldCheck className="h-7 w-7" /></div>
        <h1 className="mt-3 text-xl font-bold uppercase">D&Z Rider Passport</h1>
        <p className="mt-1 font-semibold">{passport.brand} {passport.model}</p>
        {(() => { const ti = motorcycleTypeInfo(passport.type); return ti ? (
          <p className="mt-1 text-[11px] font-medium text-primary">{ti.label} · {ti.labelBM}</p>
        ) : null; })()}
        <p className="text-sm text-muted-foreground">{passport.plate} · {passport.year}{passport.color ? " · " + passport.color : ""}</p>
        <p className="mt-2 text-lg font-bold tabular-nums">{fmtKM(passport.currentMileage)}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="text-lg font-bold tabular-nums">{verified}</div>
            <div className="text-[11px] text-muted-foreground">Verified Services</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="text-lg font-bold tabular-nums">{jobs[0] ? fmtDate(jobs[0].completedAt) : "—"}</div>
            <div className="text-[11px] text-muted-foreground">Last Service</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="text-lg font-bold tabular-nums">{formatRM(lifetime)}</div>
            <div className="text-[11px] text-muted-foreground">Lifetime Maintenance</div>
          </div>
        </div>
        <Link href="/rider/book" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          <CalendarPlus className="h-4 w-4" /> BOOK SERVICE
        </Link>
        <div className="mt-2 flex justify-center">
          <EditMotorcycle
            motorcycleId={passport.id}
            initial={{ brand: passport.brand, model: passport.model, year: passport.year, type: passport.type, color: passport.color, currentMileage: passport.currentMileage }}
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h2 className="font-semibold">Maintenance Cycle</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Tracked from verified services — when to replace next</p>
        <div className="mt-4 space-y-4">
          {(
            [
              { label: "Engine Oil", icon: Droplets, lastKm: passport.lastOilChangeMileage, intervalKm: 3000, tone: "bg-amber-500" },
              { label: "Oil Filter", icon: Filter, lastKm: passport.lastOilFilterMileage, intervalKm: 5000, tone: "bg-blue-500" },
              { label: "Chain & Sprocket", icon: Link2, lastKm: passport.lastServiceMileage, intervalKm: 3000, tone: "bg-emerald-500" },
            ] as const
          ).map((c) => {
            const used = kmUsed(passport.currentMileage, c.lastKm);
            const pct = wearProgress(passport.currentMileage, c.lastKm, c.intervalKm);
            const over = pct >= 100;
            return (
              <div key={c.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <c.icon className="h-3.5 w-3.5 text-muted-foreground" /> {c.label}
                  </span>
                  <span className={"font-semibold tabular-nums " + (over ? "text-red-600" : "text-muted-foreground")}>
                    {used == null ? "—" : fmtKM(used) + " / " + fmtKM(c.intervalKm)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={"h-full rounded-full " + (over ? "bg-red-500" : c.tone)} style={{ width: pct + "%" }} />
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {used == null ? "No record yet" : over ? "Replace now" : "Replace at " + fmtKM((c.lastKm ?? 0) + c.intervalKm)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {findings.length > 0 && (
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold">Inspection History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Findings flagged during checks and how they were resolved</p>
          <div className="mt-3 space-y-2">
            {findings.map((f) => (
              <div key={f.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{f.title}</span>
                  <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold " + (f.severity === "FAIL" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{f.severity}</span>
                </div>
                {f.note && <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono">{f.job.jobNumber} · {f.job.completedAt ? fmtDate(f.job.completedAt) : "—"}</span>
                  {f.approval ? (
                    <span className={"font-semibold " + (f.approval.status === "APPROVED" ? "text-emerald-600" : f.approval.status === "DECLINED" ? "text-red-600" : "text-muted-foreground")}>
                      {f.approval.status === "APPROVED" ? "✓ Fixed" : f.approval.status === "DECLINED" ? "Declined" : "Pending"}
                    </span>
                  ) : (
                    <span className="font-semibold text-muted-foreground">Noted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-semibold pt-2">Verified Service History</h2>
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold tracking-wide">{j.completedAt ? j.completedAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : ""}</span>
              <span className="text-muted-foreground tabular-nums">{fmtKM(j.mileage)}</span>
            </div>
            <div className="mt-1 font-semibold">{j.packageName ?? "General Service"}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {j.items.filter((i) => i.unitPriceSen === 0 || i.quantity > 0).slice(0, 6).map((i) => (
                <span key={i.id} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">✓ {i.description}</span>
              ))}
              {j.parts.map((p) => (
                <span key={p.id} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">✓ {p.product.name} ×{p.quantity}</span>
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>D&Z Smart Workshop · {j.mechanic?.name ?? ""}</span>
              <span className="font-bold text-foreground tabular-nums">{formatRM(j.invoice?.totalSen ?? 0)}</span>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No verified services yet.</p>}
      </div>
    </div>
  );
}
