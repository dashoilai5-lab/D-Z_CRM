"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/mechanic-app", label: "Orders", icon: Home },
  { href: "/mechanic-app/earnings", label: "Earnings", icon: Wallet },
  { href: "/mechanic-app/profile", label: "Profile", icon: User },
];

/** Mechanic App 底部导航（Grab 风格，active 高亮 + safe-area）。 */
export function MechanicNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t bg-background/95 backdrop-blur">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((it) => {
          const active = path === it.href || (it.href === "/mechanic-app" && path.startsWith("/mechanic-app/jobs"));
          return (
            <Link key={it.href} href={it.href} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
              <it.icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
