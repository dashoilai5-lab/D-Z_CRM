"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLang } from "@/components/shared/language-context";

export function QuotationPrintActions() {
  const router = useRouter();
  const lang = useLang();
  // 自动弹出打印/存 PDF（短暂延迟等渲染完成）；用户也可手动点按钮
  useEffect(() => {
    const id = setTimeout(() => window.print(), 450);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="print:hidden sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
        <ArrowLeft className="h-4 w-4" /> {t("mech.back", lang)}
      </button>
      <div className="text-sm font-semibold">{t("pdf.quotation-title", lang)}</div>
      <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        <Printer className="h-4 w-4" /> {t("pdf.download", lang)}
      </button>
    </div>
  );
}
