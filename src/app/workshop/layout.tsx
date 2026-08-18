import { DemoBar } from "@/components/shared/demo-bar";
import { CommandPalette } from "@/components/shared/command-palette";
import { Sidebar } from "@/components/workshop/sidebar";
import { MobileNav } from "@/components/workshop/mobile-nav";
import { getPersona } from "@/lib/demo";

export default async function WorkshopLayout({ children }: { children: React.ReactNode }) {
  const persona = await getPersona();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar current="" />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center gap-4 border-b bg-background px-6 h-16">
          <CommandPalette />
          <div className="flex-1" />
        </div>
        <DemoBar persona={persona} compact={false} />
        <main className="flex-1 px-4 md:px-6 py-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
