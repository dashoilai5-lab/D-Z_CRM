import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarPlus, ShieldCheck } from "lucide-react";
import { motorcycleService } from "@/modules/motorcycles/service";
import { db } from "@/lib/db";
import { fmtKM, fmtDate } from "@/lib/format";
import { formatRM } from "@/lib/money";

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

  return (
    <div className="space-y-4">
      <Link href="/rider/motorcycles" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" /> My Motorcycles</Link>

      <div className="rounded-3xl border bg-card p-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><ShieldCheck className="h-7 w-7" /></div>
        <h1 className="mt-3 text-xl font-bold uppercase">D&Z Rider Passport</h1>
        <p className="mt-1 font-semibold">{passport.brand} {passport.model}</p>
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
      </div>

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
