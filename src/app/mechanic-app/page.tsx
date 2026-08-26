import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { JobCard } from "@/components/mechanic/job-card";

export const dynamic = "force-dynamic";

/** Mechanic App 首页：Grab 风格订单列表（金额 + 接单）。 */
export default async function MechanicAppHome() {
  const lang = await getLang();
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) redirect("/workshop/dashboard");

  const jobs = await db.serviceJob.findMany({
    where: { mechanicId: session.user.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    include: {
      customer: { select: { name: true } },
      motorcycle: { select: { brand: true, model: true, plate: true } },
      booking: { select: { date: true, timeSlot: true, branch: { select: { city: true } } } },
      items: { where: { status: { not: "DECLINED" } }, select: { lineTotalSen: true } },
      parts: { where: { status: { not: "DECLINED" } }, select: { lineTotalSen: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  const orders = jobs.map((j) => ({
    id: j.id, jobNumber: j.jobNumber, status: j.status, customer: j.customer.name,
    brand: j.motorcycle.brand, model: j.motorcycle.model, plate: j.motorcycle.plate,
    city: j.booking?.branch.city ?? "",
    bookingDate: j.booking ? new Intl.DateTimeFormat("en-MY", { day: "2-digit", month: "short" }).format(j.booking.date) : null,
    bookingTime: j.booking?.timeSlot ?? null,
    amountSen: j.items.reduce((s, i) => s + i.lineTotalSen, 0) + j.parts.reduce((s, p) => s + p.lineTotalSen, 0),
    packageName: j.packageName,
  }));

  const pending = orders.filter((o) => o.status === "WAITING");
  const active = orders.filter((o) => o.status !== "WAITING");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Orders</h1>
          <p className="text-xs text-muted-foreground">{orders.length} order{orders.length > 1 ? "s" : ""} · {session.user.name}</p>
        </div>
        {pending.length > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">{pending.length} new</span>
        )}
      </div>

      {orders.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No orders yet — new jobs appear here.</p>
        </div>
      )}

      {/* 待接单（Grab 风格，先显示） */}
      {pending.map((o) => <JobCard key={o.id} order={o} />)}
      {/* 进行中/其他 */}
      {active.map((o) => <JobCard key={o.id} order={o} />)}
    </div>
  );
}
