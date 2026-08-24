"use client";

/**
 * 页面转场包装：方向导航（nav-forward/nav-back）滑动 + 默认淡入。
 * 必须包在 page.tsx 的根内容外层（layout 跨导航持久，enter/exit 不触发）。
 * React 的 ViewTransition 由 Next 16 内置（canary），本地类型缺失时降级为普通 div。
 */
import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VT: any = (React as any).ViewTransition;

interface Props {
  children: React.ReactNode;
  /** 前进/后退方向类型（与 Link transitionTypes 匹配） */
  direction?: "forward" | "back";
}

export function PageTransition({ children, direction = "forward" }: Props) {
  const type = direction === "forward" ? "nav-forward" : "nav-back";
  if (!VT) {
    return <div className="animate-fade-in">{children}</div>;
  }
  return (
    <VT
      enter={{ [type]: type, default: "none" }}
      exit={{ [type]: type, default: "none" }}
      default="none"
    >
      {children}
    </VT>
  );
}
