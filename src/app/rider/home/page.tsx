import Link from "next/link";
import { Bike, CalendarPlus, ChevronRight, Wrench, AlertTriangle, Clock, Bell, Tag } from "lucide-react";
import { getDemoCustomer } from "@/lib/demo-customer";
import { db } from "@/lib/db";
import { fmtKM } from "@/lib/format";
import { isPromoActive } from "@/modules/marketing/promo";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const SERVICE_INTERVAL_KM = 3000;

/** 0-100 progress between last service and the next due mileage. */
function serviceProgress(currentKm: number, lastKm: number | null, nextKm: number | null): number {
  if (nextKm == null || lastKm == null || nextKm <= lastKm) return 0;
  const used = currentKm - lastKm;
  const span = nextKm - lastKm;
  return Math.min(100, Math.max(0, Math.round((used / span) * 100)));
}

export default async function RiderHomePage() {
  const customer = await getDemoCustomer();
  const lang = await getLang();
  if (!customer) return <p className="text-sm text-muted-foreground">Demo customer not found — reset demo data.</p>;
  const bike = [...customer.motorcycles].sort((a, b) => b.currentMileage - a.currentMileage)[0];

  const [activeJob, reminder, unreadCount, campaigns] = await Promise.all([
    bike
      ? db.serviceJob.findFirst({
          where: { motorcycleId: bike.id, status: { in: ["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "READY"] } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve(null),
    bike
      ? db.serviceReminder.findFirst({
          where: { motorcycleId: bike.id },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve(null),
    db.notification.count({ where: { customerId: customer.id, readAt: null } }),
    db.campaign.findMany({ where: { type: "PROMO", status: "ACTIVE" }, orderBy: { startDate: "desc" }, take: 3 }),
  ]);
  const livePromos = campaigns.filter((c) => isPromoActive(c as never));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const lastKm = bike?.lastServiceMileage ?? null;
  const nextKm = bike?.nextServiceMileage ?? null;
  const progress = bike ? serviceProgress(bike.currentMileage, lastKm, nextKm) : 0;
  const kmLeft = bike && nextKm != null ? nextKm - bike.currentMileage : null;
  const isDue = kmLeft != null && kmLeft <= SERVICE_INTERVAL_KM * 0.1;
  const isSoon = kmLeft != null && !isDue && kmLeft <= SERVICE_INTERVAL_KM * 0.3;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-bold">{customer.name.split(" ")[0]} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          {kmLeft != null && (
            <span className={"rounded-full px-3 py-1 text-[11px] font-bold " + (isDue ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300" : isSoon ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300")}>
              {isDue ? "SERVICE DUE" : isSoon ? "SOON" : "ON TRACK"}
            </span>
          )}
          <Link href="/rider/notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-card text-muted-foreground hover:text-foreground" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
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

          {/* service reminder banner */}
          {reminder && kmLeft != null && (
            <div className={"mt-4 rounded-2xl p-4 " + (isDue ? "bg-red-50 ring-1 ring-red-200 dark:bg-red-950/40 dark:ring-red-900" : isSoon ? "bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-900" : "bg-muted/40")}>
              <div className="flex items-center justify-between text-xs">
                <span className={"inline-flex items-center gap-1.5 font-semibold " + (isDue ? "text-red-700 dark:text-red-300" : isSoon ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground")}>
                  {isDue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {isDue ? "Service is due" : isSoon ? "Service coming up" : "Next service"}
                </span>
                <span className="font-bold tabular-nums">{fmtKM(kmLeft)} left</span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className={"h-full rounded-full transition-all " + (isDue ? "bg-red-500" : isSoon ? "bg-amber-500" : "bg-emerald-500")} style={{ width: progress + "%" }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                <span>Last service {fmtKM(reminder.lastServiceMileage)}</span>
                <span>Due {fmtKM(reminder.nextServiceMileage)}</span>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">{t("rider.current-mileage", lang)}</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{fmtKM(bike.currentMileage)}</div>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">{t("rider.next-service", lang)}</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{fmtKM(bike.nextServiceMileage ?? 0)}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{bike.nextServiceEstDate ? "Estimated " + bike.nextServiceEstDate.toLocaleDateString("en-MY", { month: "long", year: "numeric" }) : "—"}</div>
            </div>
          </div>
          <Link href="/rider/book" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
            <CalendarPlus className="h-4 w-4" /> {t("rider.book-service", lang)}
          </Link>
        </div>
      )}

      {livePromos.length > 0 && (
        <Link href="/rider/promotions" className="block rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Tag className="h-4 w-4" /> SPECIAL OFFER
            </div>
            <span className="text-xs font-medium opacity-90">View all →</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {livePromos.slice(0, 2).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                {p.discountPercent && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">−{p.discountPercent}%</span>}
              </div>
            ))}
          </div>
        </Link>
      )}

      {bike && (
        <Link href={"/rider/motorcycles/" + bike.id} className="dz-card-link flex items-center justify-between rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Wrench className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-semibold">{t("rider.passport", lang)}</div>
              <div className="text-xs text-muted-foreground">{t("rider.passport-desc", lang)}</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}
    </div>
  );
}
