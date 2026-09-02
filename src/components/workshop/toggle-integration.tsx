"use client";

import { useRouter } from "next/navigation";
import { toggleIntegration } from "@/actions/integrations";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function ToggleIntegration({ id, enabled, provider }: { id: string; enabled: boolean; provider: string }) {
  const router = useRouter();
  const lang = useLang();
  return (
    <button
      className={"rounded-full px-3 py-1 text-xs font-medium " + (enabled ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}
      onClick={async () => { await toggleIntegration(id, !enabled); router.refresh(); }}
    >
      {t(enabled ? "toggle-int.enabled" : "toggle-int.disabled", lang)}
    </button>
  );
}
