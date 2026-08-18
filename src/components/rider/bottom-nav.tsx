"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bike, CalendarPlus, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const path = usePathname();
  const items = [
    { href: "/rider/home", label: "Home", icon: Home },
    { href: "/rider/motorcycles", label: "My Bike", icon: Bike },
    { href: "/rider/book", label: "Book", icon: CalendarPlus },
    { href: "/rider/service-history", label: "History", icon: History },
    { href: "/rider/profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-md flex">
        {items.map((it) => {
          const active = path === it.href || path.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href} className={cn("flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <it.icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
