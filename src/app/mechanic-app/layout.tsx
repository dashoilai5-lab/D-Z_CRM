import Link from "next/link";
import { redirect } from "next/navigation";
import { Wrench, Wallet, Clock } from "lucide-react";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

/** Mechanic App：仅 MECHANIC 角色；移动端优先 + 底部导航（Tasks / Earnings / Attendance）。 */
export default async function MechanicAppLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const session = await getSessionUser();
  if (session.kind !== "staff" || session.role !== "MECHANIC") {
    redirect("/workshop/dashboard");
  }

  const nav = [
    { href: "/mechanic-app", label: t("navr.home", lang), icon: Wrench },
    { href: "/mechanic-app/earnings", label: t("nav.invoices", lang), icon: Wallet },
    { href: "/workshop/attendance", label: t("nav.attendance", lang), icon: Clock },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Wrench className="h-4 w-4" /></span>
            <span className="font-semibold">Mechanic</span>
          </div>
          <span className="text-xs text-muted-foreground">{session.user?.name}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-5 pb-24">{children}</main>
      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t bg-background">
        <div className="flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground hover:text-foreground">
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
