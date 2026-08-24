"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bike } from "lucide-react";

/**
 * 路由切换遮罩：全屏半透明遮罩 + 中央炫酷品牌加载动画
 * （能量环 + 轨道光点 + 发光 logo + 背景光晕）。
 */
export function RouteOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"hidden" | "enter" | "leave">("hidden");
  const firstRef = useRef(true);

  // Rider App 不需要加载遮罩（轻快浏览），仅 Workshop OS 显示
  const isRider = pathname.startsWith("/rider");

  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; } // 首屏不显示
    if (isRider) return; // rider 无遮罩
    setState("enter");
    // Workshop：遮罩快速过渡（约 0.5s），不拖沓
    const t = setTimeout(() => setState("leave"), 500);
    const t2 = setTimeout(() => setState("hidden"), 800);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [pathname, searchParams, isRider]);

  if (state === "hidden" || isRider) return null;
  return (
    <div className={`dz-route-overlay ${state === "enter" ? "dz-overlay-enter" : "dz-overlay-leave"}`} aria-hidden="true">
      <div className="dz-loader">
        {/* 能量环（双环：外弧顺时针 + 内弧逆时针） */}
        <div className="dz-loader-ring" />
        <div className="dz-loader-ring-2" />
        {/* 轨道光点（3 个反向运行） */}
        <div className="dz-loader-dot d1" />
        <div className="dz-loader-dot d2" />
        <div className="dz-loader-dot d3" />
        {/* 中心发光 logo */}
        <div className="dz-loader-core">
          <Bike className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}
