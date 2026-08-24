"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bike } from "lucide-react";

/**
 * 路由切换遮罩：切页瞬间全屏半透明品牌色遮罩 + 中央 logo 呼吸动画，
 * 新页面就绪后淡出。视觉上像 App 级转场——切换时"看得到"动画。
 */
export function RouteOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"hidden" | "enter" | "leave">("hidden");
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; } // 首屏不显示
    // 路由变化 → 遮罩进入（淡入 50ms）→ 内容就绪后淡出（200ms）
    setState("enter");
    const t = setTimeout(() => setState("leave"), 220);
    const t2 = setTimeout(() => setState("hidden"), 460);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [pathname, searchParams]);

  if (state === "hidden") return null;
  return (
    <div className={`dz-route-overlay ${state === "enter" ? "dz-overlay-enter" : "dz-overlay-leave"}`} aria-hidden="true">
      <div className="dz-overlay-logo">
        <Bike className="h-8 w-8" />
      </div>
    </div>
  );
}
