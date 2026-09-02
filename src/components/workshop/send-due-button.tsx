"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { sendDueReminders } from "@/actions/reminders";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export function SendDueButton({ dueCount }: { dueCount: number }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  return (
    <button
      className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
      disabled={pending || dueCount === 0}
      onClick={() => start(async () => {
        const r = await sendDueReminders();
        router.refresh();
        toast.success(r.ok
          ? tpl(r.sent === 1 ? "send-due.sent-one" : "send-due.sent-many", lang, { n: r.sent }) + (r.failed ? " · " + tpl("send-due.failed", lang, { n: r.failed }) : "")
          : t("toast.failed", lang));
      })}
      title={t("send-due.tooltip", lang)}
    >
      <Send className="h-4 w-4" /> {t("send-due.button", lang)} ({dueCount})
    </button>
  );
}
