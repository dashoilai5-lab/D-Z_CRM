import Link from "next/link";
import { Bike, CalendarPlus, ChevronRight, Wrench } from "lucide-react";
import { getDemoCustomer } from "@/lib/demo-customer";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { fmtKM } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RiderHomePage() {
  const customer = await getDemoCustomer();
  if (!customer) return <p className="text-sm text-muted-foreground">Demo customer not found — reset demo data.</p>;
  const bike = [...customer.motorcycles].sort((a, b) => b.currentMileage - a.currentMileage)[0];

  // live job for this bike
  const activeJob = bike
    ? await db.serviceJob.findFirst({
        where: { motorcycleId: bike.id, status: { in: ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY"] } },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-2xl font-bold">{customer.name.split(" ")[0]} 👋</h1>
      </header>

      {activeJob && (
        <Link href="/rider/service-status" className="block rounded-2xl bg-primary text-primary-foreground p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            {activeJob.status === "READY" ? "YOUR MOTORCYCLE IS READY" : "YOUR MOTORCYCLE IS BEING SERVICED"}
          </div>
          <p className="mt-1 text-xs opacity-90">Job {activeJob.jobNumber} · tap for live status</p>
        </Link>
      )}

      {bike && (
        <div className="rounded-3xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg uppercase">{bike.brand} {bike.model}</div>
              <div className="text-sm text-muted-foreground">{bike.plate} · {bike.year}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bike className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Current Mileage</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{fmtKM(bike.currentMileage)}</div>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Next Service</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{fmtKM(bike.nextServiceMileage)}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{bike.nextServiceEstDate ? "Estimated " + bike.nextServiceEstDate.toLocaleDateString("en-MY", { month: "long", year: "numeric" }) : "—"}</div>
            </div>
          </div>
          <Link href="/rider/book" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
            <CalendarPlus className="h-4 w-4" /> BOOK SERVICE
          </Link>
        </div>
      )}

      {bike && (
        <Link href={"/rider/motorcycles/" + bike.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Wrench className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-semibold">D&Z Rider Passport</div>
              <div className="text-xs text-muted-foreground">Verified services · history · maintenance</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}
    </div>
  );
}
