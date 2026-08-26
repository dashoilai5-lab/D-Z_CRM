import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { AttendanceButton } from "@/components/mechanic/attendance-button";
import { formatRM } from "@/lib/money";

export const dynamic = "force-dynamic";

/** Mechanic 个人页（参考 rider profile）：头像/名字 + 统计 + 打卡（与 workshop 考勤同步）。 */
export default async function MechanicProfilePage() {
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) redirect("/workshop/dashboard");
  const me = session.user;

  const [user, jobs, payouts] = await Promise.all([
    db.user.findUnique({ where: { id: me.id }, include: { attendance: { orderBy: { date: "desc" }, take: 1 } } }),
    db.serviceJob.findMany({ where: { mechanicId: me.id, status: "COMPLETED" }, select: { id: true, invoice: { select: { totalSen: true } } } }),
    db.staffPayout.findMany({ where: { userId: me.id, status: "PAID" }, select: { totalSen: true } }),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()) + "T00:00:00Z";
  const todayAtt = user?.attendance.find((a) => a.date.toISOString().slice(0, 10) === today.slice(0, 10));
  // 最后动作判定：有 in 且（无 out 或 in 晚于 out）→ ON DUTY（当天可多次打卡）
  const lastIn = todayAtt?.checkInAt;
  const lastOut = todayAtt?.checkOutAt;
  const status = !lastIn ? { state: "NOT_CHECKED" as const, checkInAt: null, checkOutAt: null }
    : !lastOut || lastIn > lastOut ? { state: "ON_DUTY" as const, checkInAt: lastIn.toISOString(), checkOutAt: null }
    : { state: "OFF" as const, checkInAt: lastIn.toISOString(), checkOutAt: lastOut.toISOString() };

  const completed = jobs.length;
  const value = jobs.reduce((s, j) => s + (j.invoice?.totalSen ?? 0), 0);
  const paid = payouts.reduce((s, p) => s + p.totalSen, 0);
  const initials = me.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-4">
      {/* 头像 + 名字（rider profile 风格） */}
      <div className="text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">{initials}</span>
        <h1 className="mt-3 text-xl font-bold">{me.name}</h1>
        <p className="text-sm text-muted-foreground">Mechanic · {me.email ?? ""}</p>
      </div>

      {/* 统计卡 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">{completed}</div>
          <div className="text-xs text-muted-foreground">Jobs</div>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">{formatRM(value)}</div>
          <div className="text-xs text-muted-foreground">Value</div>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">{formatRM(paid)}</div>
          <div className="text-xs text-muted-foreground">Paid</div>
        </div>
      </div>

      {/* 打卡（与 workshop OS 考勤同步） */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-2 text-sm font-semibold">Attendance</div>
        <AttendanceButton status={status} />
        <p className="mt-2 text-[11px] text-muted-foreground">Synced with workshop OS attendance — owner sees your status.</p>
      </div>
    </div>
  );
}
