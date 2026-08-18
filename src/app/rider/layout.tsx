import { DemoBar } from "@/components/shared/demo-bar";
import { BottomNav } from "@/components/rider/bottom-nav";
import { getPersona } from "@/lib/demo";
import { getDemoCustomer } from "@/lib/demo-customer";

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const [persona, customer] = await Promise.all([getPersona(), getDemoCustomer()]);
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DemoBar persona={persona} compact />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
