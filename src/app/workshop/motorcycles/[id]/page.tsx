import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ShieldCheck, CalendarDays, Gauge } from "lucide-react";
import { db } from "@/lib/db";
import { fmtKM, fmtDate, fmtDateTime } from "@/lib/format";
import { formatRM } from "@/lib/money";
import { TransferMotorcycle } from "@/components/workshop/transfer-motorcycle";

export const dynamic = "force-dynamic";

export default async function MotorcycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await db.organisation.findFirst();
  const bike = await db.motorcycle.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      jobs: { include: { invoice: { select: { totalSen: true } }, mechanic: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      reminders: { orderBy: { createdAt: "desc" }, take: 5 },
      testRides: { orderBy: { rideDate: "desc" }, take: 5 },
    },
  });
  if (!bike) notFound();
  const customers = await db.customer.findMany({ where: { organisationId: org!.id }, orderBy: { name: "asc" }, select: { id: true, name: true }, take: 200 });

  return (
    <div className="max-w-4xl space-y-5">
      <Link href="/workshop/motorcycles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Motorcycles
      </Link>

      <div className="dz-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{bike.brand} {bike.model}</h1>
            <p className="text-sm text-muted-foreground">
              {bike.year} · {bike.plate}
              {bike.vin ? " · VIN " + bike.vin : ""}
              {bike.engineNo ? " · Engine " + bike.engineNo : ""}
              {bike.type ? " · " + bike.type.toLowerCase() : ""}
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground text-xs">Owner</div>
            <Link className="font-medium hover:text-primary hover:underline" href={"/workshop/customers/" + bike.customer.id}>{bike.customer.name}</Link>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Gauge className="h-3 w-3" /> Mileage</div>
            <div className="font-semibold mt-0.5">{fmtKM(bike.currentMileage)}</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Last service</div>
            <div className="font-semibold mt-0.5">{bike.lastServiceDate ? fmtDate(bike.lastServiceDate) : "—"}</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground">Next service</div>
            <div className="font-semibold mt-0.5">{bike.nextServiceMileage ? fmtKM(bike.nextServiceMileage) + " km" : "—"}</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Warranty</div>
            <div className="font-semibold mt-0.5">{bike.warrantyExpiry ? "until " + fmtDate(bike.warrantyExpiry) : bike.warrantyKm ? fmtKM(bike.warrantyKm) + " km" : "—"}</div>
          </div>
        </div>
        {bike.purchaseDate && <p className="mt-3 text-xs text-muted-foreground">Purchased {fmtDate(bike.purchaseDate)}</p>}
        {bike.notes && <p className="mt-3 text-sm border-t pt-3">{bike.notes}</p>}
        <div className="mt-4 border-t pt-4">
          <TransferMotorcycle bikeId={bike.id} currentOwnerId={bike.customerId} customers={customers} />
        </div>
      </div>

      <div className="dz-panel overflow-hidden">
        <h2 className="font-semibold px-5 pt-4">Service history ({bike.jobs.length})</h2>
        <div className="overflow-x-auto mt-2">
          <table className="dz-table">
            <thead>
              <tr>
                <th className="px-4 py-2.5 font-medium">Job</th><th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Mileage</th><th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Technician</th><th className="px-4 py-2.5 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {bike.jobs.map((j) => (
                <tr key={j.id}>
                  <td className="px-4 py-2.5"><Link className="font-mono text-xs font-semibold hover:text-primary" href={"/workshop/jobs/" + j.id}>{j.jobNumber}</Link></td>
                  <td className="px-4 py-2.5">{fmtDate(j.completedAt ?? j.createdAt)}</td>
                  <td className="px-4 py-2.5 tabular-nums">{fmtKM(j.mileage)}</td>
                  <td className="px-4 py-2.5 text-xs">{j.status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-2.5 text-xs">{j.mechanic?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums">{formatRM(j.invoice?.totalSen ?? 0)}</td>
                </tr>
              ))}
              {bike.jobs.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No service history yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {(bike.reminders.length > 0 || bike.testRides.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {bike.reminders.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-semibold text-sm mb-2">Service reminders</h3>
              {bike.reminders.map((r) => (
                <div key={r.id} className="text-xs text-muted-foreground flex justify-between py-1">
                  <span>{fmtKM(r.nextServiceMileage)} km</span><span>{r.status}</span>
                </div>
              ))}
            </div>
          )}
          {bike.testRides.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-semibold text-sm mb-2">Test rides</h3>
              {bike.testRides.map((r) => (
                <div key={r.id} className="text-xs text-muted-foreground flex justify-between py-1">
                  <span>{fmtDate(r.rideDate)}{r.timeSlot ? " " + r.timeSlot : ""}</span><span>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
