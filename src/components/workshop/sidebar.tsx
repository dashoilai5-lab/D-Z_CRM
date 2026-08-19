"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { navForPersona } from "@/lib/nav-registry";
import type { DemoUserInfo } from "@/lib/demo-user";
import type { DemoPersona } from "@/lib/persona";

/** Active if the pathname equals the nav href or lives under it (detail pages highlight their section). */
function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/workshop/dashboard") return pathname === href; // exact only, avoid over-matching
  return pathname.startsWith(href + "/");
}

export function Sidebar({ persona, user }: { persona: DemoPersona; user?: DemoUserInfo | null }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const sections = navForPersona(persona);

  if (sections.length === 0) return null;

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "hidden lg:flex shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground h-screen sticky top-0 overflow-y-auto transition-all duration-200",
        expanded ? "w-52" : "w-14"
      )}
    >
      <Link href="/workshop/dashboard" className={cn("flex items-center h-16 border-b border-sidebar-border", expanded ? "gap-2.5 px-5 mb-3" : "gap-0 justify-center mb-2")}>
        <div className="h-8 w-8 shrink-0 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
          <Bike className="h-5 w-5" />
        </div>
        <div className={cn("leading-tight overflow-hidden whitespace-nowrap transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0 w-0")}>
          <div className="font-bold text-sm">D&Z WORKSHOP OS</div>
          <div className="text-[10px] text-sidebar-foreground/60">Smart Workshop · KL</div>
        </div>
      </Link>
      {user && (
        <div className={cn("flex items-center h-16 border-b border-sidebar-border", expanded ? "gap-3 px-5 mb-3" : "gap-0 justify-center mb-2")}>
          <div className="h-9 w-9 shrink-0 rounded-full bg-sidebar-primary/20 text-sidebar-foreground flex items-center justify-center text-xs font-semibold">
            {user.initials}
          </div>
          <div className={cn("leading-tight overflow-hidden whitespace-nowrap transition-opacity duration-200 min-w-0", expanded ? "opacity-100" : "opacity-0 w-0")}>
            <div className="font-semibold text-sm truncate">{user.name}</div>
            <div className="text-[11px] text-sidebar-foreground/60 truncate">{user.roleLabel}</div>
          </div>
        </div>
      )}
      <nav className={cn("flex-1 pb-4", expanded ? "pt-0 px-3 space-y-5" : "pt-0 px-2 space-y-2")}>
        {sections.map((group, gi) => (
          <div key={gi}>
            {group.section && expanded && <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-sidebar-foreground/40">{group.section}</div>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={expanded ? undefined : item.label}
                    className={cn(
                      "relative flex items-center rounded-lg text-[13px] font-medium transition-colors",
                      expanded ? "gap-2.5 px-2.5 py-1.5" : "gap-0 justify-center px-0 py-2",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                  >
                    {active && <span className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full bg-sidebar-primary-foreground/80", expanded ? "left-1" : "left-0.5")} aria-hidden />}
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={cn("truncate transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0 w-0")}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className={cn("py-4 border-t border-sidebar-border text-[11px] text-sidebar-foreground/50", expanded ? "px-5 text-left" : "px-0 text-center")}>
        {expanded ? "D&Z PLATFORM · v0.1" : "v0.1"}
      </div>
    </aside>
  );
}
