import { cookies } from "next/headers";
import { DemoBar } from "@/components/shared/demo-bar";
import { BottomNav } from "@/components/rider/bottom-nav";
import RiderSignInPrompt from "@/components/rider/sign-in-prompt";
import { getSessionUser, demoBarVisible } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";

/** Set by the phone-preview frame (/preview) to hide the amber demo bar — shows the full rider page. */
const HIDE_DEMO_COOKIE = "dz_hide_demo";

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const [session, lang] = await Promise.all([getSessionUser(), getLang()]);
  const store = await cookies();
  const hideDemo = store.get(HIDE_DEMO_COOKIE)?.value === "1";
  const showDemoBar = demoBarVisible() && !hideDemo;

  // 生产且未登录：rider 端是顾客私有区——显示登录引导，替代页面内容
  const prodUnauthed = process.env.NODE_ENV === "production" && session.kind === "none" && !session.authenticated;

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {showDemoBar && <DemoBar persona="CUSTOMER" compact lang={lang} />}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 pb-28">
        {prodUnauthed ? <RiderSignInPrompt /> : children}
      </main>
      <BottomNav lang={lang} />
    </div>
  );
}
