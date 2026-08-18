"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addAiRecommendation } from "@/actions/workshop";

export function AiRecommendationActions({ jobId, rec }: { jobId: string; rec: { kind: string; description: string; priceSen: number; productId?: string; unitCostSen?: number } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-1.5">
      <Button size="sm" data-testid="ai-add" disabled={pending} onClick={() => start(async () => { await addAiRecommendation({ jobId, kind: rec.kind as "item" | "part", description: rec.description, quantity: 1, unitPriceSen: rec.priceSen, productId: rec.productId, unitCostSen: rec.unitCostSen }); router.refresh(); toast.success("Added " + rec.description); })}>ADD</Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => { router.refresh(); }}>SKIP</Button>
    </div>
  );
}
