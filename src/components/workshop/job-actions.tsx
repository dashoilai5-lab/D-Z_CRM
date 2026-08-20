"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { transitionJob } from "@/actions/workshop";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

export function JobActions({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();

  const run = async (to: "WAITING" | "IN_PROGRESS" | "AWAITING_APPROVAL" | "QC_CHECK" | "WAITING_PARTS" | "ON_HOLD" | "READY" | "COMPLETED" | "CANCELLED", msg?: string) => {
    start(async () => {
      try {
        const r = await transitionJob(jobId, to);
        router.refresh();
        if (r.ok && r.result) toast.success(tpl("toast.service-completed", lang, { inv: r.result.invoiceNumber, gp: "RM" + (r.result.grossProfitSen / 100) }));
        else toast.success(msg ?? t("toast.job-updated", lang));
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status === "WAITING" && <Button size="sm" disabled={pending} onClick={() => run("IN_PROGRESS", "Job started")}>Start Service</Button>}
      {["WAITING", "IN_PROGRESS", "AWAITING_APPROVAL", "QC_CHECK"].includes(status) && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run("QC_CHECK", "Sent to QC")}>QC Check</Button>
      )}
      {["IN_PROGRESS", "AWAITING_APPROVAL", "QC_CHECK", "WAITING_PARTS", "ON_HOLD"].includes(status) && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run("READY", "Marked ready for collection")}>Mark Ready</Button>
      )}
      {["IN_PROGRESS", "AWAITING_APPROVAL", "QC_CHECK", "ON_HOLD"].includes(status) && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run("WAITING_PARTS", "Waiting for parts")}>Waiting Parts</Button>
      )}
      {["IN_PROGRESS", "AWAITING_APPROVAL", "QC_CHECK", "WAITING_PARTS"].includes(status) && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run("ON_HOLD", "On hold")}>On Hold</Button>
      )}
      {["READY", "IN_PROGRESS", "AWAITING_APPROVAL", "QC_CHECK"].includes(status) && (
        <Button size="sm" disabled={pending} onClick={() => run("COMPLETED")}>Complete Job</Button>
      )}
      {status !== "COMPLETED" && status !== "CANCELLED" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("CANCELLED", "Job cancelled")}>Cancel</Button>
      )}
    </div>
  );
}
