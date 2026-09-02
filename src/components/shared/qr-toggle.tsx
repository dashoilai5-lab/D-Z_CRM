"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Eye, EyeOff, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/**
 * 可折叠 QR 码（QR-001..003 共用展示组件）。
 * - toggle 按钮展开/收起
 * - 点击 QR 打开放大模态（X / 背景 / Esc 关闭）
 * 纯 client 渲染（react-qr-code 输出 SVG，无需 canvas）。
 */
export function QrToggle({
  value,
  label,
  defaultShow = true,
  className,
  size = 112,
}: {
  value: string;
  label?: string;
  defaultShow?: boolean;
  className?: string;
  size?: number;
}) {
  const lang = useLang();
  const _label = label ?? t("common.qr-code", lang);
  const [show, setShow] = useState(defaultShow);
  const [zoomed, setZoomed] = useState(false);

  // Esc 关闭放大模态
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomed(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [zoomed]);

  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent"
        title={show ? t("common.hide-qr", lang) : t("common.show-qr", lang)}
      >
        {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {show ? t("common.hide", lang) : _label}
      </button>
      {show && (
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="group relative rounded-lg border bg-white p-2 transition-transform hover:scale-[1.02] active:scale-95"
          style={{ width: size + 20 }}
          title={t("common.tap-to-enlarge", lang)}
          aria-label={t("common.enlarge-qr", lang)}
        >
          <QRCode value={value} size={size} style={{ width: "100%", height: "auto" }} />
          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-opacity group-hover:bg-black/10 group-hover:opacity-100">
            <Maximize2 className="h-6 w-6 text-primary" />
          </span>
        </button>
      )}

      {/* 放大模态 */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label={t("common.close", lang)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <QRCode value={value} size={260} style={{ width: "100%", height: "auto" }} />
            <p className="mt-3 text-center text-xs font-medium text-muted-foreground">{t("common.scan-to-open", lang)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
