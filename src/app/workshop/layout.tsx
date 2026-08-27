import { CommandPalette } from "@/components/shared/command-palette";
import { ThemeControls } from "@/components/shared/theme-controls";
import { ScanQrButton } from "@/components/workshop/scan-qr-button";
import { Sidebar } from "@/components/workshop/sidebar";
import { MobileNav, type MobileNavItem } from "@/components/workshop/mobile-nav";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { can } from "@/lib/auth/permissions";
import { navForRoleWithPerms, navItemForPath } from "@/lib/nav-perms";
import { getSessionUser, personaForRole } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";

export default async function WorkshopLayout({ children }: { children: React.ReactNode }) {
  const [session, lang] = await Promise.all([getSessionUser(), getLang()]);

  // —— Workshop OS 访问守卫：仅员工且非 MECHANIC ——
  if (!session.authenticated) redirect("/login");
  if (session.kind === "customer") redirect("/rider/home"); // rider 不能进 workshop OS（电脑版也不行）
  if (session.role === "MECHANIC") redirect("/mechanic-app"); // mechanic 只能 app

  // —— URL 级模块守卫：当前页归属 module 无 view 权限 → 拦回 dashboard（Developer Settings 开关即时生效） ——
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const navItem = navItemForPath(pathname);
  if (navItem?.module) {
    const allowed = await can({ id: session.user!.id, role: session.role as never, organisationId: session.orgId }, navItem.module, "view");
    if (!allowed) redirect("/workshop/dashboard");
  }

  // Sidebar 需要 persona（nav-registry 按角色导航分组过滤）+ 用户信息
  const persona = personaForRole(session.role);

  const sidebarUser = session.authenticated
    ? { id: session.user?.id ?? "", name: session.name, roleLabel: session.role, initials: session.initials }
    : undefined;

  // 导航：DB Permission 覆盖感知（Developer Settings 开关即时反映）；sidebar/mobile 共用
  const filteredNav = session.authenticated ? await navForRoleWithPerms(session.orgId, session.role, persona) : [];
  const MOBILE_KEYS = new Set(["dashboard", "customers", "bookings", "jobs", "mechanic"]);
  const mobileItems: MobileNavItem[] = filteredNav
    .flatMap((g) => g.items)
    .filter((i) => MOBILE_KEYS.has(i.key))
    .slice(0, 5)
    .map((i) => ({ key: i.key, href: i.href, label: i.label }));

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar persona={persona} sections={filteredNav} role={session.authenticated ? session.role : undefined} user={sidebarUser} lang={lang} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center gap-4 border-b bg-background px-6 h-16">
          <CommandPalette />
          <div className="flex-1" />
          <ScanQrButton />
          <ThemeControls />
        </div>
        <main className="flex-1 px-4 md:px-6 py-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">{children}</main>
        <MobileNav items={mobileItems.length ? mobileItems : [{ key: "dashboard", href: "/workshop/dashboard", label: "Dashboard" }]} />
      </div>
    </div>
  );
}
