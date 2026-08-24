import { DemoBar } from "@/components/shared/demo-bar";
import { CommandPalette } from "@/components/shared/command-palette";
import { ThemeControls } from "@/components/shared/theme-controls";
import { Sidebar } from "@/components/workshop/sidebar";
import { MobileNav, type MobileNavItem } from "@/components/workshop/mobile-nav";
import { navForRole } from "@/lib/nav-registry";
import { getSessionUser, demoBarVisible, personaForRole } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { LayoutDashboard, Users, CalendarClock, Wrench, ClipboardList } from "lucide-react";

export default async function WorkshopLayout({ children }: { children: React.ReactNode }) {
  const [session, lang] = await Promise.all([getSessionUser(), getLang()]);
  const showDemoBar = demoBarVisible();

  // Sidebar 需要 persona（nav-registry 按 persona 过滤）+ 用户信息
  const persona = session.authenticated
    ? personaForRole(session.role)
    : (session.kind === "demo-staff" ? "OWNER" : "OWNER");

  const sidebarUser = session.authenticated
    ? { id: session.user?.id ?? "", name: session.name, roleLabel: session.role, initials: session.initials }
    : session.demoUser ?? undefined;

  // 移动端底部导航：从权限过滤后的导航取 5 个核心项（dashboard/customers/bookings/jobs/mechanic）
  const filteredNav = session.authenticated ? navForRole(session.role, persona as never) : [];
  const MOBILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    dashboard: LayoutDashboard, customers: Users, bookings: CalendarClock, jobs: Wrench, mechanic: ClipboardList,
  };
  const mobileItems: MobileNavItem[] = filteredNav
    .flatMap((g) => g.items)
    .filter((i) => MOBILE_ICONS[i.key])
    .slice(0, 5)
    .map((i) => ({ href: i.href, label: i.label, icon: MOBILE_ICONS[i.key] }));

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar persona={persona as never} role={session.authenticated ? session.role : undefined} user={sidebarUser} lang={lang} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center gap-4 border-b bg-background px-6 h-16">
          <CommandPalette />
          <div className="flex-1" />
          <ThemeControls />
        </div>
        {showDemoBar && <DemoBar persona={persona as never} compact={false} lang={lang} />}
        <main className="flex-1 px-4 md:px-6 py-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">{children}</main>
        <MobileNav items={mobileItems.length ? mobileItems : [{ href: "/workshop/dashboard", label: "Dashboard", icon: LayoutDashboard }]} />
      </div>
    </div>
  );
}
