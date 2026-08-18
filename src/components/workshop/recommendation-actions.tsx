"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptRecommendation, declineRecommendation } from "@/actions/workshop";

export function RecommendationActions({ jobId, kind, id, status }: { jobId: string; kind: "item" | "part"; id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (status !== "RECOMMENDED") return null;
  return (
    <div className="flex gap-1.5 justify-end">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { await acceptRecommendation(jobId, kind, id); router.refresh(); toast.success("Added to job"); })}>ADD</Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { await declineRecommendation(jobId, kind, id); router.refresh(); toast.success("Skipped"); })}>SKIP</Button>
    </div>
  );
}
