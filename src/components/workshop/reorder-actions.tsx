"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createPurchaseOrder } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export function ReorderActions({ productId, productName, quantity, recommended }: { productId: string; productName: string; quantity: number; recommended: number }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
      const supplier = await fetch("/api/supplier-for-product?productId=" + productId).then((r) => r.json());
      await createPurchaseOrder({ supplierId: supplier.supplierId, items: [{ productId, quantity: recommended, unitCostSen: supplier.costSen }] });
      router.refresh();
      toast.success(tpl("reorder.created", lang, { name: productName, n: recommended }));
    })}>
      {tpl("reorder.button", lang, { n: recommended })}
    </Button>
  );
}
