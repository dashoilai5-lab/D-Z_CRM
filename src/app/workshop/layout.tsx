import { DemoBar } from "@/components/shared/demo-bar";
import { CommandPalette } from "@/components/shared/command-palette";
import { ThemeControls } from "@/components/shared/theme-controls";
import { Sidebar } from "@/components/workshop/sidebar";
import { MobileNav } from "@/components/workshop/mobile-nav";
import { getSessionUser, demoBarVisible, personaForRole } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";

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

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar persona={persona as never} user={sidebarUser} lang={lang} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center gap-4 border-b bg-background px-6 h-16">
          <CommandPalette />
          <div className="flex-1" />
          <ThemeControls />
        </div>
        {showDemoBar && <DemoBar persona={persona as never} compact={false} lang={lang} />}
        <main className="flex-1 px-4 md:px-6 py-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
