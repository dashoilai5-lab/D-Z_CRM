// Workshop navigation registry — single source of truth for department views.
// Owner: full access. Counter staff: front-desk (bookings/customers/jobs/inventory
// view/AI). Mechanic: own jobs (board/jobs/checklists/KPI). The sidebar renders
// exactly what the current persona is entitled to see.

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, UserCheck, BellRing, CalendarClock, Wrench, ClipboardList, ListChecks, Package,
  Store, Megaphone, MessageSquare, Star, Users2, Gauge, Boxes, AlertTriangle, Archive, RefreshCw,
  ShoppingCart, Truck, Wallet, Sparkles, Settings,
} from "lucide-react";
import type { DemoPersona } from "@/lib/persona";

export interface NavChild {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Personas that may see this child. Absent = all workshop personas. */
  access?: DemoPersona[];
}

export interface NavSection {
  section: string | null;
  items: NavChild[];
}

const WORKSHOP_PERSONAS: DemoPersona[] = ["OWNER", "COUNTER_STAFF", "MECHANIC"];

export function isWorkshopAccess(p: DemoPersona): boolean {
  return (WORKSHOP_PERSONAS as readonly string[]).includes(p);
}

export function personaSees(p: DemoPersona, access?: DemoPersona[]): boolean {
  if (access === undefined) return isWorkshopAccess(p);
  return (access as readonly string[]).includes(p);
}

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    section: null,
    items: [{ key: "dashboard", label: "Dashboard", href: "/workshop/dashboard", icon: LayoutDashboard }],
  },
  {
    section: "CUSTOMERS",
    items: [
      { key: "customers", label: "Customers", href: "/workshop/customers", icon: Users, access: ["OWNER", "COUNTER_STAFF"] },
      { key: "return-list", label: "Customer Return List", href: "/workshop/crm/return-list", icon: UserCheck, access: ["OWNER", "COUNTER_STAFF"] },
      { key: "reminders", label: "Service Reminders", href: "/workshop/crm/reminders", icon: BellRing, access: ["OWNER", "COUNTER_STAFF"] },
    ],
  },
  {
    section: "WORKSHOP",
    items: [
      { key: "bookings", label: "Bookings", href: "/workshop/bookings", icon: CalendarClock, access: ["OWNER", "COUNTER_STAFF"] },
      { key: "jobs", label: "Service Jobs", href: "/workshop/jobs", icon: Wrench, access: ["OWNER", "COUNTER_STAFF", "MECHANIC"] },
      { key: "mechanic", label: "Mechanic Board", href: "/workshop/mechanic", icon: ClipboardList, access: ["OWNER", "MECHANIC"] },
      { key: "checklists", label: "Checklists", href: "/workshop/checklists", icon: ListChecks, access: ["OWNER", "MECHANIC"] },
      { key: "packages", label: "Service Packages", href: "/workshop/packages", icon: Package, access: ["OWNER", "COUNTER_STAFF"] },
    ],
  },
  {
    section: "MARKETING",
    items: [
      { key: "calendar", label: "Promotion Calendar", href: "/workshop/marketing/calendar", icon: Store, access: ["OWNER"] },
      { key: "posters", label: "Poster Library", href: "/workshop/marketing/posters", icon: Megaphone, access: ["OWNER"] },
      { key: "scripts", label: "Reels Script Bank", href: "/workshop/marketing/scripts", icon: MessageSquare, access: ["OWNER"] },
      { key: "reviews", label: "Reviews", href: "/workshop/marketing/reviews", icon: Star, access: ["OWNER"] },
    ],
  },
  {
    section: "STAFF",
    items: [
      { key: "staff", label: "Staff", href: "/workshop/staff", icon: Users2, access: ["OWNER"] },
      { key: "kpi", label: "KPI Board", href: "/workshop/staff/kpi", icon: Gauge, access: ["OWNER", "MECHANIC"] },
    ],
  },
  {
    section: "INVENTORY",
    items: [
      { key: "products", label: "Products", href: "/workshop/inventory/products", icon: Boxes, access: ["OWNER", "COUNTER_STAFF"] },
      { key: "stock", label: "Stock", href: "/workshop/inventory/stock", icon: Package, access: ["OWNER", "COUNTER_STAFF"] },
      { key: "alerts", label: "Stock Alerts", href: "/workshop/inventory/alerts", icon: AlertTriangle, access: ["OWNER"] },
      { key: "dead-stock", label: "Dead Stock", href: "/workshop/inventory/dead-stock", icon: Archive, access: ["OWNER"] },
      { key: "reorder", label: "Reorder", href: "/workshop/inventory/reorder", icon: RefreshCw, access: ["OWNER"] },
      { key: "purchase-orders", label: "Purchase Orders", href: "/workshop/inventory/purchase-orders", icon: ShoppingCart, access: ["OWNER"] },
      { key: "suppliers", label: "Suppliers", href: "/workshop/inventory/suppliers", icon: Truck, access: ["OWNER"] },
    ],
  },
  {
    section: "FINANCE",
    items: [{ key: "profit", label: "Profit Dashboard", href: "/workshop/finance/profit", icon: Wallet, access: ["OWNER"] }],
  },
  {
    section: "AI CENTRE",
    items: [{ key: "ai", label: "Today's Recommendations", href: "/workshop/ai", icon: Sparkles, access: ["OWNER", "COUNTER_STAFF"] }],
  },
  {
    section: null,
    items: [{ key: "settings", label: "Settings", href: "/workshop/settings", icon: Settings, access: ["OWNER"] }],
  },
];

/** Sections the current persona is entitled to see (empty groups dropped). */
export function navForPersona(persona: DemoPersona): NavSection[] {
  return NAV_SECTIONS.map((g) => ({
    section: g.section,
    items: g.items.filter((i) => personaSees(persona, i.access)),
  })).filter((g) => g.items.length > 0);
}

/** Flat list of accessible hrefs for a persona — used for URL-level gating. */
export function accessibleHrefs(persona: DemoPersona): string[] {
  return navForPersona(persona).flatMap((g) => g.items.map((i) => i.href));
}
