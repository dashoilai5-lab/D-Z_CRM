"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { sendReminder } from "@/actions/reminders";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function ReminderRowActions({ reminderId, customerId, motorcycleId, nextServiceMileage }: { reminderId: string; customerId: string; motorcycleId: string; nextServiceMileage: number }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" disabled={pending}
      onClick={() => start(async () => { const r = await sendReminder(reminderId); router.refresh(); toast.success(r.ok ? t("reminder.sent", lang) : (r.error ?? t("toast.failed", lang))); })}>
      <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> {t("reminder.message", lang)}
    </Button>
  );
}
