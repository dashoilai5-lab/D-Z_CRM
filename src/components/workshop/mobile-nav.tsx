"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface MobileNavItem { href: string; label: string; icon: React.ComponentType<{ className?: string }>; }

export function MobileNav({ items }: { items: MobileNavItem[] }) {
  const path = usePathname();
  return (
    <nav className="lg:hidden sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
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
