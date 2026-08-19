// Sidebar navigation registry — the single source of truth for workshop nav
// (hrefs, labels, icons, and persona access). The sidebar, any bottom nav, and
// (later) request-level checks all derive from this one table.
//
// Theory (mirrors dashoil-internal-platform):
//   1. Navigation follows access, not pages — each entry declares which
//      personas may see it; the sidebar renders exactly what the current
//      persona is entitled to ("what you can see is what you are").
//   2. The sidebar is decoration, not security — hiding a link is UX. Real
//      enforcement belongs at the request layer (middleware) and, in
//      production, Postgres RLS (see docs/HANDOFF.md §65).
//   3. Two-level hierarchy — top-level items are business domains; child
//      options are the pages inside that domain.

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
  /** Domain label shown above the group; null = no header. */
  section: string | null;
  items: NavChild[];
}

export type NavAccess = DemoPersona[] | undefined;

// --- persona helpers ---------------------------------------------------------

const WORKSHOP_PERSONAS: DemoPersona[] = ["OWNER", "COUNTER_STAFF", "MECHANIC"];

/** A persona is a workshop-side role (not the rider customer). */
export function isWorkshopAccess(p: DemoPersona): boolean {
  return (WORKSHOP_PERSONAS as readonly string[]).includes(p);
}

/**
 * True if a persona may see a nav entry. Absent access = visible to every
 * workshop persona (the demo bar only shows workshop-side roles anyway).
 */
export function personaSees(p: DemoPersona, access?: NavAccess): boolean {
  if (access === undefined) return isWorkshopAccess(p);
  return (access as readonly string[]).includes(p);
}

// --- the registry (single source of truth) ----------------------------------

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
      { key: "staff", label: "Staff", href: "/workshop/staff/kpi", icon: Users2, access: ["OWNER"] },
      { key: "kpi", label: "KPI Board", href: "/workshop/staff/kpi", icon: Gauge, access: ["OWNER"] },
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

/** Flat map of every accessible href for a persona — useful for route checks. */
export function accessibleHrefs(persona: DemoPersona): string[] {
  return navForPersona(persona).flatMap((g) => g.items.map((i) => i.href));
}
