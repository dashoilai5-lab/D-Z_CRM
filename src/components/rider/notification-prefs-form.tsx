"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateRiderNotificationPrefs } from "@/actions/rider-settings";
import type { NotificationPrefs } from "@/lib/rider-prefs";
import { t, type Lang } from "@/lib/i18n";

const PREFS: { key: keyof NotificationPrefs; labelKey: string; descKey: string }[] = [
  { key: "serviceReminders", labelKey: "prefs.service-reminders", descKey: "prefs.service-reminders-desc" },
  { key: "bookingUpdates", labelKey: "prefs.booking-updates", descKey: "prefs.booking-updates-desc" },
  { key: "marketingOffers", labelKey: "prefs.marketing-offers", descKey: "prefs.marketing-offers-desc" },
  { key: "appNews", labelKey: "prefs.app-news", descKey: "prefs.app-news-desc" },
];

/** Rider 通知偏好开关组（Settings → Notifications）。 */
export function NotificationPrefsForm({ initial, lang }: { initial: NotificationPrefs; lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [prefs, setPrefs] = useState(initial);

  const save = () =>
    start(async () => {
      const r = await updateRiderNotificationPrefs(prefs);
      if (r.ok) {
        toast.success(t("prefs.saved", lang));
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });

  return (
    <div className="space-y-3">
      {PREFS.map((p) => (
        <div key={p.key} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t(p.labelKey, lang)}</p>
            <p className="text-xs text-muted-foreground">{t(p.descKey, lang)}</p>
          </div>
          <Switch
            checked={prefs[p.key]}
            onCheckedChange={() => setPrefs((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
          />
        </div>
      ))}
      <Button className="w-full" disabled={pending} onClick={save}>
        {pending ? t("common.loading", lang) : t("prefs.save", lang)}
      </Button>
    </div>
  );
}
