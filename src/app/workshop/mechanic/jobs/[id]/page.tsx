import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { jobService } from "@/modules/service-jobs/service";
import { ChecklistRunner } from "@/components/workshop/checklist-runner";
import { StatusBadge } from "@/components/shared/status-badge";
import { fmtKM } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MechanicJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await jobService.getDetail(id);
  if (!detail) notFound();

  const checklistItems = detail.checklist?.items.map((i) => ({ id: i.id, name: i.name, result: i.result, note: i.note })) ?? [];
  const findings = detail.findings.map((f) => ({
    id: f.id, title: f.title, severity: f.severity, note: f.note, recommendedRepair: f.recommendedRepair, priceSen: f.priceSen,
    status: f.status, approvalStatus: f.approval?.status,
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/workshop/mechanic" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Mechanic Board
      </Link>
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-2xl font-bold font-mono tracking-tight">#{detail.jobNumber}</h1>
        <StatusBadge kind="job" value={detail.status} />
      </div>
      <div className="rounded-2xl border bg-card p-4 mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{detail.motorcycle.brand} {detail.motorcycle.model}</div>
          <div className="text-xs text-muted-foreground">{detail.motorcycle.plate} · {detail.customer.name}</div>
        </div>
        <div className="text-right text-sm">
          <div className="text-xs text-muted-foreground">Mileage</div>
          <div className="font-bold">{fmtKM(detail.mileage)}</div>
        </div>
      </div>

      <ChecklistRunner jobId={detail.id} jobNumber={detail.jobNumber} items={checklistItems} findings={findings} hasChecklist={!!detail.checklist} status={detail.status} />
    </div>
  );
}
