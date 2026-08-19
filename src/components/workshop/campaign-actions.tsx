"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, CheckCircle2 } from "lucide-react";
import { updateCampaign } from "@/actions/marketing";

export function CampaignActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const go = (to: "ACTIVE" | "ENDED") =>
    start(async () => {
      await updateCampaign({ id, status: to });
      router.refresh();
      toast.success(to === "ACTIVE" ? "Campaign launched" : "Campaign ended");
    });

  if (status === "ACTIVE") {
    return (
      <button onClick={() => go("ENDED")} disabled={pending} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40" title="End campaign">
        <CheckCircle2 className="h-3.5 w-3.5" /> End
      </button>
    );
  }
  if (status === "DRAFT" || status === "SCHEDULED") {
    return (
      <button onClick={() => go("ACTIVE")} disabled={pending} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40" title="Launch campaign">
        <Play className="h-3.5 w-3.5" /> Launch
      </button>
    );
  }
  return null;
}
