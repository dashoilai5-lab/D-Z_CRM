"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarClock, Wrench, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard, customers: Users, bookings: CalendarClock, jobs: Wrench, mechanic: ClipboardList,
};

export interface MobileNavItem { key: string; href: string; label: string; }

export function MobileNav({ items }: { items: MobileNavItem[] }) {
  const path = usePathname();
  return (
    <nav className="lg:hidden sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {items.map((it) => {
          const Icon = ICONS[it.key];
          const active = path === it.href || path.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href} transitionTypes={["nav-forward"]} className={cn("flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              {Icon && <Icon className="h-5 w-5" />}
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
