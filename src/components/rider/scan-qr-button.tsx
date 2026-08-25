"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import { QrScanner } from "@/components/workshop/qr-scanner";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/**
 * Rider 首页「扫码」按钮 → 打开相机扫码器。
 * 扫码场景（QR-003 等）：扫门店 QR 绑定服务门店 / 扫摩托/车主 QR 查看档案，识别 /qr/<type>/<token> 后自动跳转。
 */
export function RiderScanQrButton() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-card text-muted-foreground hover:text-foreground"
        aria-label={t("qr.scan-title", lang)}
        title={t("qr.scan-title", lang)}
      >
        <ScanLine className="h-5 w-5" />
      </button>
      {open && <QrScanner onClose={() => setOpen(false)} />}
    </>
  );
}
