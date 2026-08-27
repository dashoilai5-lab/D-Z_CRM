"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bike, ArrowRight } from "lucide-react";
import { AddMotorcycle } from "@/components/rider/add-motorcycle";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

/** 首辆摩托引导：注册表单 + 「稍后再说」跳过（记 sessionStorage，首页仍显示提醒卡）。 */
export function BikeFirstPrompt({ customerId }: { customerId: string }) {
  const router = useRouter();
  const lang = useLang();
  const [busy, start] = useTransition();

  const skip = () => {
    start(() => {
      try { sessionStorage.setItem("rider.skipFirstBike", "1"); } catch {}
      router.push("/rider/home");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-card p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bike className="h-6 w-6" />
        </div>
        <h1 className="mt-3 text-xl font-bold">{t("bike.first-title", lang)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("bike.first-desc", lang)}</p>
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <AddMotorcycle customerId={customerId} onDone={() => { router.push("/rider/home"); router.refresh(); }} />
      </div>
      <button type="button" onClick={skip} disabled={busy} className="w-full rounded-md border py-2 text-sm font-medium hover:bg-accent disabled:opacity-50">
        {t("bike.skip", lang)}
      </button>
    </div>
  );
}
