"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X, SkipForward } from "lucide-react";
import { WORKSHOP_TUTORIALS, type TutorialDef, type TutorialStep } from "./tutorial-definitions";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STORAGE_KEY = (userId: string) => `dz.tutorial.v1.${userId}`;
const SESSION_DISMISS_KEY = (userId: string, id: string) => `dz.tutorial.session.${userId}.${id}`;

interface Props { userId: string; }

export function FeatureTutorial({ userId }: Props) {
  const pathname = usePathname();
  const lang = useLang();
  const [def, setDef] = useState<TutorialDef | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [active, setActive] = useState(false);

  // 路由匹配：到哪个功能页才触发哪个引导
  useEffect(() => {
    if (!userId) return;
    const found = WORKSHOP_TUTORIALS.find((d) => pathname === d.route || pathname.startsWith(d.route + "/"));
    const show = (d: TutorialDef | null) => {
      const raf = requestAnimationFrame(() => {
        if (d) { setDef(d); setStepIdx(0); setActive(true); }
        else { setActive(false); setDef(null); }
      });
      return () => cancelAnimationFrame(raf);
    };
    if (!found) return show(null);
    const done = (window.localStorage.getItem(STORAGE_KEY(userId)) ?? "").split(",").filter(Boolean);
    const dismissed = window.sessionStorage.getItem(SESSION_DISMISS_KEY(userId, found.id));
    if (done.includes(found.id) || dismissed) return show(null);
    return show(found);
  }, [pathname, userId]);

  // 响应 help menu 的“重放”请求：即使已完成 / 路径不变也强制显示
  useEffect(() => {
    if (!userId) return;
    function onReplay(e: Event) {
      const id = (e as CustomEvent).detail?.id as string | undefined;
      if (!id) return;
      const found = WORKSHOP_TUTORIALS.find((d) => d.id === id);
      if (!found) return;
      window.sessionStorage.removeItem(SESSION_DISMISS_KEY(userId, id));
      const done = new Set((window.localStorage.getItem(STORAGE_KEY(userId)) ?? "").split(",").filter(Boolean));
      done.delete(id);
      window.localStorage.setItem(STORAGE_KEY(userId), [...done].join(","));
      setDef(found); setStepIdx(0); setActive(true);
    }
    window.addEventListener("dz-tutorial-replay", onReplay);
    return () => window.removeEventListener("dz-tutorial-replay", onReplay);
  }, [userId]);

  if (!active || !def) return null;
  const step: TutorialStep = def.steps[stepIdx] ?? def.steps[0];
  const title = t(step.titleKey, lang);
  const body = t(step.bodyKey, lang);

  function targetRect() {
    if (!step.target) return { top: 120, left: 40, width: 0, height: 0 };
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return { top: 120, left: 40, width: 0, height: 0 };
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }
  const rect = targetRect();
  const isLast = stepIdx === def.steps.length - 1;
  const tipLeft = rect.width ? rect.left + rect.width / 2 - 190 : 40;
  const tipTop = rect.top > 200 ? rect.top - 90 : rect.top + rect.height + 20;

  function finish() {
    const done = new Set((window.localStorage.getItem(STORAGE_KEY(userId)) ?? "").split(",").filter(Boolean));
    done.add(def!.id);
    window.localStorage.setItem(STORAGE_KEY(userId), [...done].join(","));
    setActive(false); setDef(null);
  }
  function dismiss() {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY(userId, def!.id), "1");
    setActive(false); setDef(null);
  }
  function next() { isLast ? finish() : setStepIdx((i) => i + 1); }
  function prev() { if (stepIdx > 0) setStepIdx((i) => i - 1); }

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" />
      <div className="pointer-events-auto absolute w-[380px] rounded-2xl border bg-white shadow-2xl" style={{ left: Math.max(16, tipLeft), top: tipTop }}>
        <div className="flex items-start justify-between gap-2 p-4 pb-2">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary")}>{t("tut.step", lang)} {stepIdx + 1} / {def.steps.length}</span>
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </div>
          <button onClick={dismiss} aria-label={t("tut.close", lang)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <p className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
        <div className="flex items-center justify-between border-t px-4 py-2">
          <button onClick={dismiss} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><SkipForward className="h-3.5 w-3.5" /> {t("tut.skip", lang)}</button>
          <div className="flex items-center gap-1">
            {stepIdx > 0 && (<button onClick={prev} className="rounded-md border px-2.5 py-1 text-xs flex items-center gap-1"><ChevronLeft className="h-3.5 w-3.5" /> {t("tut.prev", lang)}</button>)}
            <button onClick={next} className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs font-medium flex items-center gap-1">{isLast ? t("tut.done", lang) : t("tut.next", lang)} <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
