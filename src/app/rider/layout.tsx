import { headers } from "next/headers";
import { BottomNav } from "@/components/rider/bottom-nav";
import RiderSignInPrompt from "@/components/rider/sign-in-prompt";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const [session, lang] = await Promise.all([getSessionUser(), getLang()]);

  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const isAuthPage = pathname === "/rider/login" || pathname === "/rider/signup";

  // 未登录：rider 端是顾客私有区——显示登录引导（登录/注册页除外）
  const unauthed = !isAuthPage && session.kind === "none" && !session.authenticated;

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      {/* 认证页（login/signup）无底部导航；其他页保留（内容底部预留 nav 空间） */}
      <main className={"flex-1 w-full max-w-md mx-auto px-4 py-6 " + (isAuthPage ? "pb-10" : "pb-28")}>
        {unauthed ? <RiderSignInPrompt lang={lang} /> : children}
      </main>
      {!isAuthPage && <BottomNav lang={lang} />}
    </div>
  );
}
