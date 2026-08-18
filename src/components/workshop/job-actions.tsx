"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { transitionJob } from "@/actions/workshop";

export function JobActions({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = async (to: "WAITING" | "IN_PROGRESS" | "READY" | "COMPLETED" | "CANCELLED", msg?: string) => {
    start(async () => {
      try {
        const r = await transitionJob(jobId, to);
        router.refresh();
        if (r.ok && r.result) toast.success("Service completed — invoice " + r.result.invoiceNumber + " · GP " + "RM" + (r.result.grossProfitSen / 100));
        else toast.success(msg ?? "Job updated");
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status === "WAITING" && <Button size="sm" disabled={pending} onClick={() => run("IN_PROGRESS", "Job started")}>Start Service</Button>}
      {(status === "IN_PROGRESS" || status === "AWAITING_APPROVAL") && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run("READY", "Marked ready for collection")}>Mark Ready</Button>
      )}
      {(status === "READY" || status === "IN_PROGRESS" || status === "AWAITING_APPROVAL") && (
        <Button size="sm" disabled={pending} onClick={() => run("COMPLETED")}>Complete Job</Button>
      )}
      {status !== "COMPLETED" && status !== "CANCELLED" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("CANCELLED", "Job cancelled")}>Cancel</Button>
      )}
    </div>
  );
}
