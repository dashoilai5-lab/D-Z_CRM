"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** 自动刷新间隔（毫秒）。 */
const AUTO_REFRESH_MS = 30_000;

/**
 * Workshop 刷新控件：手动刷新按钮 + 自动刷新开关（默认开，30 秒 router.refresh()）。
 * - router.refresh() 软刷新：重新拉 server 组件数据，保留客户端滚动/表单状态
 * - 顶部常驻（desktop header / mobile sticky 条）
 */
export function RefreshControls({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [auto, setAuto] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doRefresh = () => {
    setSpinning(true);
    router.refresh();
    // refresh 无完成回调——短暂旋转反馈
    setTimeout(() => setSpinning(false), 700);
  };

  useEffect(() => {
    if (!auto) return;
    timerRef.current = setInterval(doRefresh, AUTO_REFRESH_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  return (
    <div className={cn("flex items-center gap-1.5", compact ? "justify-end" : "")}>
      {/* 手动刷新 */}
      <button
        type="button"
        onClick={doRefresh}
        title="Refresh"
        aria-label="Refresh"
        className={cn(
          "inline-flex items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          compact ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <RefreshCw className={cn("h-4 w-4", spinning && "animate-spin")} />
      </button>
      {/* 自动刷新开关 */}
      <button
        type="button"
        onClick={() => setAuto((v) => !v)}
        title={auto ? "Auto-refresh on (30s)" : "Auto-refresh off"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-colors",
          auto ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-background text-muted-foreground hover:bg-accent"
        )}
      >
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", auto ? "bg-emerald-500" : "bg-muted-foreground/40")} />
        Auto
      </button>
    </div>
  );
}
