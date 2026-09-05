"use client";
import type { ReactNode } from "react";
import { AppBrandIcon, type DZApp } from "@/components/shared/app-brand-icon";
import { LanguageSwitcher } from "@/components/rider/language-switcher";
import { useLang } from "@/components/shared/language-context";

/**
 * 三端登录页共用骨架：按 app 渲染专属配色（login-theme-* 覆盖 --primary）、
 * 名牌徽章、品牌图标块、标题/口号、卡片壳与底部角色行/互跳链接。
 * 表单逻辑由各页以 children 传入。
 */
export function LoginShell({ app, eyebrow, title, tagline, footer, children }: {
  app: DZApp;
  eyebrow: string;
  title: string;
  tagline: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const lang = useLang();
  return (
    <div className={`login-theme-${app} min-h-dvh flex items-center justify-center bg-muted/30 px-4 py-8 relative overflow-hidden`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(90% 65% at 50% 0%, var(--app-glow), transparent 70%)" }}
      />
      <div className="w-full max-w-sm relative">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher current={lang} />
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30">
            <AppBrandIcon app={app} className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
        </div>

        <div className="rounded-2xl border bg-card/95 backdrop-blur p-6 shadow-xl shadow-black/5">
          {children}
        </div>

        {footer && <div className="mt-4 space-y-1 text-center text-xs text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
