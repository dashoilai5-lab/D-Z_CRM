"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bike, CalendarPlus, Newspaper, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n";

export function BottomNav({ lang = "en" }: { lang?: Lang }) {
  const path = usePathname();
  const items = [
    { href: "/rider/home", label: t("navr.home", lang), icon: Home },
    { href: "/rider/motorcycles", label: t("navr.my-bike", lang), icon: Bike },
    { href: "/rider/book", label: t("navr.book", lang), icon: CalendarPlus },
    { href: "/rider/service-history", label: t("navr.news", lang), icon: Newspaper },
    { href: "/rider/profile", label: t("navr.profile", lang), icon: User },
  ];
  // fixed 底部居中锁定：位置（bottom-0 + 水平居中）与尺寸（max-w-md 与内容同宽）恒定，
  // 不随内容高度变化；safe-area 由内层 padding 处理。
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-md border-t bg-background/95 backdrop-blur">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {items.map((it) => {
          const active = path === it.href || path.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href} className={cn("flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <it.icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
