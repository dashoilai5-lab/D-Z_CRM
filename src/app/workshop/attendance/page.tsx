import { PageHeader } from "@/components/shared/page-header";
import { AttendancePanel } from "@/components/workshop/attendance-panel";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/** Mechanic 考勤：打卡上下班 + 全员可用状态列表（ON DUTY 置顶）。 */
export default async function AttendancePage() {
  const lang = await getLang();
  const session = await getSessionUser();

  // 今天（+8）UTC 零点
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()) + "T00:00:00Z");
  const org = await db.organisation.findFirst();
  const mechanics = await db.user.findMany({
    where: { organisationId: org!.id, role: "MECHANIC", active: true },
    select: { id: true, name: true, attendance: { where: { date: today }, select: { checkInAt: true, checkOutAt: true } } },
    orderBy: { name: "asc" },
  });
  const rows = mechanics.map((m) => ({
    id: m.id,
    name: m.name,
    checkInAt: m.attendance[0]?.checkInAt?.toISOString() ?? null,
    checkOutAt: m.attendance[0]?.checkOutAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <PageHeader title={t("att.title", lang)} subtitle={t("att.subtitle", lang)} />
      <AttendancePanel mechanics={rows} currentUserId={session.kind === "staff" && session.user ? session.user.id : ""} lang={lang} />
    </div>
  );
}
