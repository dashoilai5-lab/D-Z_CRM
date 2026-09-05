"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/** Mechanic App 底部导航（active 高亮 + safe-area + alerts 未读角标，i18n）。 */
export function MechanicNav({ unread = 0 }: { unread?: number }) {
  const path = usePathname();
  const lang = useLang();
  const items = [
    { href: "/mechanic-app", label: t("mech.orders", lang), icon: Home },
    { href: "/mechanic-app/notifications", label: t("mech.alerts", lang), icon: Bell, badge: unread },
    { href: "/mechanic-app/earnings", label: t("mech.earnings", lang), icon: Wallet },
    { href: "/mechanic-app/profile", label: t("mech.profile", lang), icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border/70 bg-background/95 backdrop-blur shadow-[0_-8px_28px_-14px_oklch(0.35_0.08_45_/_0.3)]">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {items.map((it) => {
          const active = path === it.href || (it.href === "/mechanic-app" && path.startsWith("/mechanic-app/jobs"));
          return (
            <Link key={it.href} href={it.href} className={cn("relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors duration-300 ease-spring", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <span className={cn("relative flex h-7 w-12 items-center justify-center rounded-full transition-all duration-300 ease-spring", active ? "bg-primary/10" : "")}>
                <it.icon className="h-5 w-5" />
                {it.badge != null && it.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">{it.badge > 99 ? "99+" : it.badge}</span>
                )}
              </span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}