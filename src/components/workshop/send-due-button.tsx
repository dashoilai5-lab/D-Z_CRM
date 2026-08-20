"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { sendDueReminders } from "@/actions/reminders";

export function SendDueButton({ dueCount }: { dueCount: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
      disabled={pending || dueCount === 0}
      onClick={() => start(async () => {
        const r = await sendDueReminders();
        router.refresh();
        toast.success(r.ok ? "Sent " + r.sent + " reminder" + (r.sent === 1 ? "" : "s") + (r.failed ? " · " + r.failed + " failed" : "") : "Failed");
      })}
      title="Send WhatsApp reminders to all due customers now (manual trigger of the scheduled job)"
    >
      <Send className="h-4 w-4" /> Send all due ({dueCount})
    </button>
  );
}
