import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Bike } from "lucide-react";
import { db } from "@/lib/db";
import { jobService } from "@/modules/service-jobs/service";
import { getSessionUser } from "@/lib/session-user";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { StatusBadge } from "@/components/shared/status-badge";
import { JobActions } from "@/components/workshop/job-actions";
import { ChecklistRunner } from "@/components/workshop/checklist-runner";
import { SopPhotoCapture } from "@/components/mechanic/sop-photo-capture";
import { formatRM } from "@/lib/money";
import { fmtKM } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Mechanic App Job 详情：服务明细 + 检查单 + 状态流转。 */
export default async function MechanicJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) redirect("/workshop/dashboard");

  const detail = await jobService.getDetail(id);
  if (!detail) notFound();
  if (detail.mechanicId && detail.mechanicId !== session.user.id) notFound();

  const pendingApprovals = detail.approvals.filter((a) => a.status === "PENDING");
  const billed = detail.items.filter((i) => i.status !== "DECLINED").reduce((s, i) => s + i.lineTotalSen, 0)
    + detail.parts.filter((p) => p.status !== "DECLINED").reduce((s, p) => s + p.lineTotalSen, 0);
  const photos = detail.photos ?? [];
  const sopComplete = photos.length >= 5;

  return (
    <div className="space-y-4">
      <Link href="/mechanic-app" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> {t("mech.back", lang)}
      </Link>

      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-lg font-bold">{detail.jobNumber}</span>
          <StatusBadge kind="job" value={detail.status} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Bike className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{detail.motorcycle.brand} {detail.motorcycle.model}</span>
          <span className="font-mono text-xs text-muted-foreground">{detail.motorcycle.plate}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{detail.customer.name} · {fmtKM(detail.mileage)}</div>
        {pendingApprovals.length > 0 && (
          <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            {t("mech.approval-waiting", lang).replace("{n}", String(pendingApprovals.length))}
          </div>
        )}
        <div className="mt-3"><JobActions jobId={detail.id} status={detail.status} sopComplete={sopComplete} /></div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <SopPhotoCapture
          jobId={detail.id}
          canCapture={detail.status === "WAITING"}
          photos={photos.map((p) => ({ angle: p.angle, photoUrl: p.photoUrl, capturedAt: p.capturedAt ? p.capturedAt.toISOString() : null }))}
        />
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h3 className="font-semibold mb-2">{t("mech.service-items", lang)}</h3>
        <div className="space-y-1">
          {detail.items.filter((i) => i.status !== "DECLINED").map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span>{i.description} ×{i.quantity}</span>
              <span className="tabular-nums">{formatRM(i.lineTotalSen)}</span>
            </div>
          ))}
          {detail.parts.filter((p) => p.status !== "DECLINED").map((p) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span>{p.product?.name ?? "Part"} ×{p.quantity}</span>
              <span className="tabular-nums">{formatRM(p.lineTotalSen)}</span>
            </div>
          ))}
          {(detail.items.length === 0 && detail.parts.length === 0) && <p className="text-xs text-muted-foreground">{t("mech.no-items", lang)}</p>}
        </div>
        <div className="mt-2 flex justify-between border-t pt-2 text-sm font-bold">
          <span>{t("mech.total", lang)}</span><span className="tabular-nums">{formatRM(billed)}</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <ChecklistRunner
          jobId={detail.id}
          jobNumber={detail.jobNumber}
          items={(detail.checklist?.items ?? []).map((i) => ({ id: i.id, name: i.name, result: i.result, note: i.note }))}
          findings={detail.approvals.map((a) => ({ id: a.id, title: a.title, severity: "WARN", note: a.description, recommendedRepair: a.title, priceSen: a.amountSen, status: a.status, approvalStatus: a.status }))}
          hasChecklist={!!detail.checklist}
          status={detail.status}
        />
      </div>
    </div>
  );
}
