"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike, LayoutDashboard, Users, UserCheck, CalendarClock, Wrench, ClipboardList, ListChecks, Package, Store, BellRing, MessageSquare, Megaphone, Star, Users2, Gauge, Boxes, AlertTriangle, Archive, RefreshCw, Truck, ShoppingCart, Wallet, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { section: null, items: [{ href: "/workshop/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "CUSTOMERS",
    items: [
      { href: "/workshop/customers", label: "Customers", icon: Users },
      { href: "/workshop/crm/return-list", label: "Customer Return List", icon: UserCheck },
      { href: "/workshop/crm/reminders", label: "Service Reminders", icon: BellRing },
    ],
  },
  {
    section: "WORKSHOP",
    items: [
      { href: "/workshop/bookings", label: "Bookings", icon: CalendarClock },
      { href: "/workshop/jobs", label: "Service Jobs", icon: Wrench },
      { href: "/workshop/mechanic", label: "Mechanic Board", icon: ClipboardList },
      { href: "/workshop/checklists", label: "Checklists", icon: ListChecks },
      { href: "/workshop/packages", label: "Service Packages", icon: Package },
    ],
  },
  {
    section: "MARKETING",
    items: [
      { href: "/workshop/marketing/calendar", label: "Promotion Calendar", icon: Store },
      { href: "/workshop/marketing/posters", label: "Poster Library", icon: Megaphone },
      { href: "/workshop/marketing/scripts", label: "Reels Script Bank", icon: MessageSquare },
      { href: "/workshop/marketing/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    section: "STAFF",
    items: [{ href: "/workshop/staff/kpi", label: "Staff", icon: Users2 }, { href: "/workshop/staff/kpi", label: "KPI Board", icon: Gauge }],
  },
  {
    section: "INVENTORY",
    items: [
      { href: "/workshop/inventory/products", label: "Products", icon: Boxes },
      { href: "/workshop/inventory/stock", label: "Stock", icon: Package },
      { href: "/workshop/inventory/alerts", label: "Stock Alerts", icon: AlertTriangle },
      { href: "/workshop/inventory/dead-stock", label: "Dead Stock", icon: Archive },
      { href: "/workshop/inventory/reorder", label: "Reorder", icon: RefreshCw },
      { href: "/workshop/inventory/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
      { href: "/workshop/inventory/suppliers", label: "Suppliers", icon: Truck },
    ],
  },
  {
    section: "FINANCE",
    items: [{ href: "/workshop/finance/profit", label: "Profit Dashboard", icon: Wallet }],
  },
  {
    section: "AI CENTRE",
    items: [{ href: "/workshop/ai", label: "Today's Recommendations", icon: Sparkles }],
  },
  {
    section: null,
    items: [{ href: "/workshop/settings", label: "Settings", icon: Settings }],
  },
];

/** Active if the pathname equals the nav href or lives under it (detail pages highlight their section). */
function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/workshop/dashboard") return pathname === href; // exact only, avoid over-matching
  return pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground h-screen sticky top-0 overflow-y-auto">
      <Link href="/workshop/dashboard" className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
          <Bike className="h-4.5 w-4.5 h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-sm">D&Z WORKSHOP OS</div>
          <div className="text-[10px] text-sidebar-foreground/60">Smart Workshop · KL</div>
        </div>
      </Link>
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.section && <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-sidebar-foreground/40">{group.section}</div>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                  >
                    {active && <span className="absolute left-1 top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full bg-sidebar-primary-foreground/80" aria-hidden />}
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-sidebar-border text-[11px] text-sidebar-foreground/50">
        D&Z PLATFORM · v0.1 prototype
      </div>
    </aside>
  );
}
