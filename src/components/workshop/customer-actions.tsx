"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendReminder } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function CustomerActions({ customerId, motorcycleId, nextServiceMileage }: { customerId: string; motorcycleId: string; nextServiceMileage: number | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const lang = useLang();
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={pending || !nextServiceMileage}
        onClick={() => start(async () => { await sendReminder(customerId, motorcycleId, nextServiceMileage ?? 0); router.refresh(); toast.success(t("customer-action.toast-reminder", lang)); })}>
        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> {t("customer-action.send-reminder", lang)}
      </Button>
      <Button size="sm" variant="outline" onClick={() => router.push("/workshop/jobs/new?customer=" + customerId)}>
        <CalendarPlus className="h-3.5 w-3.5 mr-1.5" /> {t("customer-action.create-job", lang)}
      </Button>
    </div>
  );
}
