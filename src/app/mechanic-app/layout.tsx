import { redirect } from "next/navigation";
import { AppBrandIcon } from "@/components/shared/app-brand-icon";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { db } from "@/lib/db";
import { MechanicNav } from "@/components/mechanic/mechanic-nav";

/** Mechanic App：仅 MECHANIC 角色；移动端 app 布局（rider 风格 + Grab 底部导航）。 */
export default async function MechanicAppLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const session = await getSessionUser();
  if (session.kind === "customer") redirect("/rider/home"); // rider 顾客不能进 mechanic app
  if (session.kind !== "staff" || session.role !== "MECHANIC") {
    redirect("/workshop/dashboard"); // 其他员工 → workshop OS
  }

  // alerts 未读角标（userId-scoped notifications 未读计数）
  const unread = session.user ? await db.notification.count({ where: { userId: session.user.id, readAt: null } }) : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><AppBrandIcon app="mechanic" className="h-4 w-4" /></span>
            <span className="font-semibold">{t("mech.app", lang)}</span>
          </div>
          <span className="text-xs text-muted-foreground">{session.user?.name}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-5 pb-28">{children}</main>
      <MechanicNav unread={unread} />
    </div>
  );
}
