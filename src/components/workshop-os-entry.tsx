"use client";

import Link from "next/link";
import { Wrench, ArrowRight } from "lucide-react";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function WorkshopOSEntry() {
  const lang = useLang();
  return (
    <Link href="/workshop/dashboard" className="group rounded-3xl border bg-card p-7 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Wrench className="h-6 w-6" /></div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
      <h3 className="text-xl font-semibold mt-5">D&Z Workshop OS</h3>
      <p className="text-sm text-muted-foreground mt-1">{t("home.wsos_desc", lang)}</p>
      <div className="mt-4 text-sm font-medium text-primary">{t("home.wsos_open", lang)}</div>
    </Link>
  );
}
