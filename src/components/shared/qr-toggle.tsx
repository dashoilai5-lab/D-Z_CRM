"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 可折叠 QR 码（QR-001..003 共用展示组件）。
 * 默认按 show 决定初始显示；提供 toggle 按钮。
 * 纯 client 渲染（react-qr-code 输出 SVG，无需 canvas）。
 */
export function QrToggle({
  value,
  label = "QR Code",
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
  const [show, setShow] = useState(defaultShow);
  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent"
        title={show ? "Hide QR" : "Show QR"}
      >
        {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {show ? "Hide" : label}
      </button>
      {show && (
        <div className="rounded-lg border bg-white p-2" style={{ width: size + 20 }}>
          <QRCode value={value} size={size} style={{ width: "100%", height: "auto" }} />
        </div>
      )}
    </div>
  );
}
