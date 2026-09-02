"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import { QrScanner } from "@/components/workshop/qr-scanner";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/** Workshop 顶栏「扫码」按钮 → 打开相机扫码器。 */
export function ScanQrButton() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-accent"
        title={t("ws.ctrl.scan-qr", lang)}
        aria-label={t("ws.ctrl.scan-qr", lang)}
      >
        <ScanLine className="h-4 w-4" />
      </button>
      {open && <QrScanner onClose={() => setOpen(false)} />}
    </>
  );
}
