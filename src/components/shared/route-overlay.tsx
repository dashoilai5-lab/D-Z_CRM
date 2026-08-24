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

  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; } // 首屏不显示
    setState("enter");
    // 遮罩停留久一点（约 1.6s：能量环转一圈 + 光点两圈），让炫酷动画完整可见
    const t = setTimeout(() => setState("leave"), 1600);
    const t2 = setTimeout(() => setState("hidden"), 1900);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [pathname, searchParams]);

  if (state === "hidden") return null;
  return (
    <div className={`dz-route-overlay ${state === "enter" ? "dz-overlay-enter" : "dz-overlay-leave"}`} aria-hidden="true">
      <div className="dz-loader">
        {/* 能量环（conic-gradient 旋转） */}
        <div className="dz-loader-ring" />
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
