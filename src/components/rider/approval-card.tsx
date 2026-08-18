"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { respondApproval } from "@/actions/rider";
import { formatRM } from "@/lib/money";

export function ApprovalCard({ approval }: { approval: { id: string; title: string; description: string | null; amountSen: number; status: string; job: { jobNumber: string; motorcycle: { brand: string; model: string; plate: string } } } }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (approval.status !== "PENDING") {
    return (
      <div className="rounded-2xl border bg-card p-4 opacity-70">
        <div className="text-sm font-semibold">{approval.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{approval.job.jobNumber} · {approval.job.motorcycle.plate}</div>
        <div className="mt-1 text-xs font-semibold uppercase text-emerald-600">{approval.status === "APPROVED" ? "Approved ✓" : "Declined ✗"}</div>
      </div>
    );
  }

  const respond = (d: "APPROVED" | "DECLINED") =>
    start(async () => {
      await respondApproval(approval.id, d);
      router.refresh();
      toast.success(d === "APPROVED" ? "Approved — the workshop has been notified" : "Declined — the workshop has been notified");
    });

  return (
    <div data-testid="approval-card" className="rounded-2xl border-2 border-amber-200 bg-card p-5">
      <div className="text-[11px] font-bold uppercase tracking-wide text-amber-600">Additional Work Required</div>
      <h3 className="mt-1 text-lg font-bold uppercase">{approval.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{approval.job.motorcycle.brand} {approval.job.motorcycle.model} · {approval.job.motorcycle.plate}</p>
      {approval.description && (
        <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Mechanic Note</span>
          {approval.description}
        </div>
      )}
      <div className="mt-4 text-2xl font-bold tabular-nums">{formatRM(approval.amountSen)}</div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" data-testid="approval-decline" disabled={pending} onClick={() => respond("DECLINED")}>DECLINE</Button>
        <Button data-testid="approval-approve" disabled={pending} onClick={() => respond("APPROVED")}>APPROVE {formatRM(approval.amountSen)}</Button>
      </div>
    </div>
  );
}
