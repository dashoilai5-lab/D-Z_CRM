"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bike } from "lucide-react";

/**
 * 路由切换遮罩：全屏半透明遮罩 + 中央炫酷品牌加载动画
 * （能量环 + 轨道光点 + 发光 logo + 背景光晕）。
 * Workshop：快（0.5s）；Rider：稍慢（0.8s）——两端都要动画。
 */
export function RouteOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"hidden" | "enter" | "leave">("hidden");
  const firstRef = useRef(true);

  const isRider = pathname.startsWith("/rider");

  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; } // 首屏不显示
    setState("enter");
    // Workshop 快（0.5s），Rider 稍慢（0.8s）
    const hold = isRider ? 800 : 500;
    const t = setTimeout(() => setState("leave"), hold);
    const t2 = setTimeout(() => setState("hidden"), hold + 300);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [pathname, searchParams, isRider]);

  if (state === "hidden") return null;
  return (
    <div className={`dz-route-overlay ${state === "enter" ? "dz-overlay-enter" : "dz-overlay-leave"}`} aria-hidden="true">
      <div className="dz-loader">
        <div className="dz-loader-ring" />
        <div className="dz-loader-ring-2" />
        <div className="dz-loader-dot d1" />
        <div className="dz-loader-dot d2" />
        <div className="dz-loader-dot d3" />
        <div className="dz-loader-core">
          <Bike className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}
