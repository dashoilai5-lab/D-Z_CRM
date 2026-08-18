"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createPurchaseOrder } from "@/actions/workshop";

export function ReorderActions({ productId, productName, quantity, recommended }: { productId: string; productName: string; quantity: number; recommended: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
      const supplier = await fetch("/api/supplier-for-product?productId=" + productId).then((r) => r.json());
      await createPurchaseOrder({ supplierId: supplier.supplierId, items: [{ productId, quantity: recommended, unitCostSen: supplier.costSen }] });
      router.refresh();
      toast.success("Reorder draft created for " + productName + " ×" + recommended);
    })}>
      Reorder {recommended}×
    </Button>
  );
}
