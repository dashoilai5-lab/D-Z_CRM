"use client";

import { useRouter } from "next/navigation";
import { toggleIntegration } from "@/actions/integrations";

export function ToggleIntegration({ id, enabled, provider }: { id: string; enabled: boolean; provider: string }) {
  const router = useRouter();
  return (
    <button
      className={"rounded-full px-3 py-1 text-xs font-medium " + (enabled ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}
      onClick={async () => { await toggleIntegration(id, !enabled); router.refresh(); }}
    >
      {enabled ? "Enabled" : "Disabled"}
    </button>
  );
}
