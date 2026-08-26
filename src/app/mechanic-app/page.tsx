import Link from "next/link";
import { redirect } from "next/navigation";
import { Bike, ChevronRight, Wrench } from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { StatusBadge } from "@/components/shared/status-badge";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Mechanic App 首页：分配给我的 job（今日优先，轮询自动刷新）。 */
export default async function MechanicAppHome() {
  const lang = await getLang();
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) redirect("/workshop/dashboard");

  const jobs = await db.serviceJob.findMany({
    where: { mechanicId: session.user.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    include: { customer: { select: { name: true } }, motorcycle: { select: { brand: true, model: true, plate: true } }, booking: { select: { date: true, timeSlot: true } } },
    orderBy: { createdAt: "asc" },
  });

  const active = jobs.filter((j) => j.status === "WAITING" || j.status === "IN_PROGRESS" || j.status === "AWAITING_APPROVAL");
  const other = jobs.filter((j) => !active.includes(j));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("navr.home", lang)}</h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{jobs.length} jobs</span>
      </div>

      {jobs.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <Wrench className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No jobs assigned yet.</p>
        </div>
      )}

      {active.map((j) => <JobCard key={j.id} job={j} lang={lang} />)}
      {other.map((j) => <JobCard key={j.id} job={j} lang={lang} />)}
    </div>
  );
}

function JobCard({ job, lang }: { job: { id: string; jobNumber: string; status: string; customer: { name: string }; motorcycle: { brand: string; model: string; plate: string }; booking: { date: Date; timeSlot: string } | null }; lang: string }) {
  return (
    <Link href={"/mechanic-app/jobs/" + job.id} className="block rounded-2xl border bg-card p-4 hover:border-primary/40">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-primary">{job.jobNumber}</span>
        <StatusBadge kind="job" value={job.status} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Bike className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{job.motorcycle.brand} {job.motorcycle.model}</span>
        <span className="font-mono text-xs text-muted-foreground">{job.motorcycle.plate}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{job.customer.name}{job.booking ? " · " + fmtDate(job.booking.date) + " " + job.booking.timeSlot : ""}</div>
      <div className="mt-2 flex items-center justify-end text-xs font-medium text-primary"><ChevronRight className="h-3.5 w-3.5" /></div>
    </Link>
  );
}
