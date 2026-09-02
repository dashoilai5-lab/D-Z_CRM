"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, CheckCircle2 } from "lucide-react";
import { updateCampaign } from "@/actions/marketing";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function CampaignActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const lang = useLang();

  const go = (to: "ACTIVE" | "ENDED") =>
    start(async () => {
      await updateCampaign({ id, status: to });
      router.refresh();
      toast.success(to === "ACTIVE" ? t("campaign.toast-launched", lang) : t("campaign.toast-ended", lang));
    });

  if (status === "ACTIVE") {
    return (
      <button onClick={() => go("ENDED")} disabled={pending} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40" title={t("campaign.title-end", lang)}>
        <CheckCircle2 className="h-3.5 w-3.5" /> {t("campaign.end", lang)}
      </button>
    );
  }
  if (status === "DRAFT" || status === "SCHEDULED") {
    return (
      <button onClick={() => go("ACTIVE")} disabled={pending} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40" title={t("campaign.title-launch", lang)}>
        <Play className="h-3.5 w-3.5" /> {t("campaign.launch", lang)}
      </button>
    );
  }
  return null;
}
