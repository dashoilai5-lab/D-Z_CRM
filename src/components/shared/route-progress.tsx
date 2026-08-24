"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * 全局路由切换进度条：监听 pathname/searchParams 变化，
 * 切换期间顶部显示品牌橙细条（CSS 动画），新页面就绪后自动淡出。
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; } // 首屏不显示
    setVisible(true);
    // 新页面渲染完成后隐藏（微任务 + 双帧，让骨架屏/内容有机会挂载）
    const t = setTimeout(() => setVisible(false), 350);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  if (!visible) return null;
  return <div className="dz-route-progress" aria-hidden="true" />;
}
