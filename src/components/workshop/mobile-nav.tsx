"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarClock, Wrench, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const path = usePathname();
  const items = [
    { href: "/workshop/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/workshop/customers", label: "Customers", icon: Users },
    { href: "/workshop/bookings", label: "Bookings", icon: CalendarClock },
    { href: "/workshop/jobs", label: "Jobs", icon: Wrench },
    { href: "/workshop/mechanic", label: "Mechanic", icon: ClipboardList },
  ];
  return (
    <nav className="lg:hidden sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="flex">
        {items.map((it) => {
          const active = path === it.href || path.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href} className={cn("flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <it.icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
