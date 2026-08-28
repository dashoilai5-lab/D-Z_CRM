"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X, SkipForward } from "lucide-react";
import { RIDER_TUTORIALS, type RiderTutorialDef, type RiderTutorialStep } from "./rider-tutorial-definitions";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

const STORAGE_KEY = (id: string) => `rider.tutorial.${id}`;
const SESSION_DISMISS_KEY = (id: string, tutId: string) => `rider.tutorial.session.${id}.${tutId}`;
const WELCOME_KEY = (id: string) => `rider.tutorial${id}.started`;

interface Props { customerId: string; hasBike: boolean; }

export function FeatureTutorialRider({ customerId, hasBike }: Props) {
  const pathname = usePathname();
  const lang = useLang();
  const [def, setDef] = useState<RiderTutorialDef | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [active, setActive] = useState(false);
  const [spot, setSpot] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // 首次进入某功能页触发该页引导；无车（hasBike=false）则交由 bike-first，先不引导
  useEffect(() => {
    if (!customerId) return;
    // 无车 / 欢迎未展示时先记录 started，但不强弹（交给 bike-first 引导注册车）
    const started = window.localStorage.getItem(WELCOME_KEY(customerId));
    if (!started) {
      window.localStorage.setItem(WELCOME_KEY(customerId), "1");
    }
    const found = RIDER_TUTORIALS.find((d) => pathname === d.route || pathname.startsWith(d.route + "/"));
    const show = (d: RiderTutorialDef | null) => {
      const raf = requestAnimationFrame(() => {
        if (d) { setDef(d); setStepIdx(0); setActive(true); }
        else { setActive(false); setDef(null); }
      });
      return () => cancelAnimationFrame(raf);
    };
    if (!found) return show(null);
    // service-status / approvals 仅在 hasBike? 其实这些页用户能到才触发；无车时先不弹其他页
    const done = (window.localStorage.getItem(STORAGE_KEY(customerId)) ?? "").split(",").filter(Boolean);
    const dismissed = window.sessionStorage.getItem(SESSION_DISMISS_KEY(customerId, found.id));
    if (done.includes(found.id) || dismissed) return show(null);
    if (!hasBike && ["service-status", "approvals"].includes(found.id)) return show(null);
    return show(found);
  }, [pathname, customerId, hasBike]);

  // 步骤变化：滚动到目标 + 读取位置
  useEffect(() => {
    if (!active || !def) return;
    const target = def.steps[stepIdx]?.target;
    const raf = requestAnimationFrame(() => {
      if (!target) { setSpot({ top: 90, left: 40, width: 0, height: 0 }); return; }
      const read = () => {
        const el = document.querySelector(target) as HTMLElement | null;
        if (!el) { setSpot({ top: 90, left: 40, width: 0, height: 0 }); return; }
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const r = el.getBoundingClientRect();
        setSpot({ top: r.top, left: r.left, width: r.width, height: r.height });
      };
      read();
      const timer = setTimeout(read, 300);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, [active, def?.id, def?.steps?.[stepIdx]?.target, stepIdx]);

  if (!active || !def) return null;
  const step: RiderTutorialStep = def.steps[stepIdx] ?? def.steps[0];
  const title = t(step.titleKey, lang);
  const body = t(step.bodyKey, lang);
  const hasTarget = !!step.target && step.target !== "";
  const rect = spot ?? { top: 90, left: 40, width: 0, height: 0 };
  const isLast = stepIdx === def.steps.length - 1;
  // 气泡：手机适配 —— 目标下方 or 顶部居中，避免底部导航
  const tipLeft = Math.max(16, (window.innerWidth - 340) / 2);
  const tipTop = hasTarget && rect.top ? rect.top + rect.height + 12 : 90;

  function finish() {
    const done = new Set((window.localStorage.getItem(STORAGE_KEY(customerId)) ?? "").split(",").filter(Boolean));
    done.add(def!.id);
    window.localStorage.setItem(STORAGE_KEY(customerId), [...done].join(","));
    setActive(false); setDef(null);
  }
  function dismiss() {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY(customerId, def!.id), "1");
    setActive(false); setDef(null);
  }
  function next() { if (isLast) { finish(); return; } setStepIdx((i) => i + 1); }
  function prev() { if (stepIdx > 0) setStepIdx((i) => i - 1); }

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none" role="dialog" aria-modal="true">
      {hasTarget ? (
        <div className="pointer-events-none absolute rounded-lg border-2 border-primary ring-4 ring-primary/20 transition-all duration-200"
          style={{ left: rect.left - 4, top: rect.top - 4, width: rect.width + 8, height: rect.height + 8, boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }} />
      ) : (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="pointer-events-auto absolute w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border bg-white shadow-2xl" style={{ left: tipLeft, top: tipTop }}>
        <div className="flex items-start justify-between gap-2 p-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold">{t("tut.step", lang)} {stepIdx + 1} / {def.steps.length}</span>
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
