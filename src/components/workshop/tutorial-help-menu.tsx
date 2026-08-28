"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Check, ChevronDown } from "lucide-react";
import { WORKSHOP_TUTORIALS } from "./tutorial-definitions";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props { userId: string; }

const STORAGE_KEY = (userId: string) => `dz.tutorial.v1.${userId}`;

/** 顶栏「引导」入口：列出可重放的功能引导 + 完成状态。点击跳转到该功能页并重放。 */
export function TutorialHelpMenu({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const lang = useLang();

  useEffect(() => {
    if (!userId) return;
    const readDone = () => setDone(new Set((localStorage.getItem(STORAGE_KEY(userId)) ?? "").split(",").filter(Boolean)));
    readDone();
    window.addEventListener("storage", readDone);
    return () => window.removeEventListener("storage", readDone);
  }, [userId]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
        aria-label={t("tut.help-title", lang)}
      >
        <GraduationCap className="h-4 w-4" /> <span className="hidden md:inline">{t("tut.help", lang)}</span> <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-64 rounded-xl border bg-popover text-popover-foreground shadow-xl">
          <div className="px-3 py-2 border-b">
            <div className="text-sm font-semibold">{t("tut.help-title", lang)}</div>
            <div className="text-[11px] text-muted-foreground">{t("tut.help-sub", lang)}</div>
          </div>
          <div className="max-h-72 overflow-auto p-1">
            {WORKSHOP_TUTORIALS.map((d) => {
              const isDone = done.has(d.id);
              return (
                <button
                  key={d.id}
                  className={cn("w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-accent text-foreground")}
                  onClick={() => {
                    setOpen(false);
                    // 清掉完成标记，允许重放
                    const nd = new Set(done); nd.delete(d.id);
                    localStorage.setItem(STORAGE_KEY(userId), [...nd].join(","));
                    setDone(nd);
                    // 通知 FeatureTutorial 强制重放该功能引导
                    window.dispatchEvent(new CustomEvent("dz-tutorial-replay", { detail: { id: d.id } }));
                    if (window.location.pathname !== d.route) router.push(d.route);
                  }}
                >
                  <span className={cn("flex-1")}>{t(d.labelKey, lang)}</span>
                  {isDone && <Check className="h-4 w-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
