"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { receivePurchaseOrder } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function POReceive({ poId, status }: { poId: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const lang = useLang();
  if (status === "RECEIVED") return null;
  const run = () =>
    start(async () => {
      const result = await receivePurchaseOrder(poId);
      router.refresh();
      if (result.ok) toast.success(t("po.toast-received", lang));
    });
  return (
    <Button size="sm" data-testid="po-receive" disabled={pending} onClick={run}>
      {pending ? t("po.receiving", lang) : t("po.receive", lang)}
    </Button>
  );
}
