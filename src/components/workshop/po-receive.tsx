"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { receivePurchaseOrder } from "@/actions/workshop";

export function POReceive({ poId, status }: { poId: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (status === "RECEIVED") return null;
  const run = () =>
    start(async () => {
      const result = await receivePurchaseOrder(poId);
      router.refresh();
      if (result.ok) toast.success("PO received — stock updated");
    });
  return (
    <Button size="sm" data-testid="po-receive" disabled={pending} onClick={run}>
      {pending ? "Receiving…" : "Receive Stock"}
    </Button>
  );
}
