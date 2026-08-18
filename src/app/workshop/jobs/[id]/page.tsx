import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, BadgeCheck, CheckCircle2, XCircle } from "lucide-react";
import { jobService } from "@/modules/service-jobs/service";
import { aiService } from "@/modules/ai/service";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { JobActions } from "@/components/workshop/job-actions";
import { RecommendationActions } from "@/components/workshop/recommendation-actions";
import { AiRecommendationActions } from "@/components/workshop/ai-recommendation-actions";
import { fmtDate, fmtDateTime, fmtKM } from "@/lib/format";
import { formatRM } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await jobService.getDetail(id);
  if (!detail) notFound();
  const recs = await aiService.salesRecommendations(id);
  const checklist = detail.checklist;
  const pendingApprovals = detail.approvals.filter((a) => a.status === "PENDING");

  return (
    <div>
      <PageHeader
        title={<span className="font-mono">{detail.jobNumber}</span>}
        subtitle={"Created " + fmtDateTime(detail.createdAt)}
        backHref="/workshop/jobs"
      />
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <StatusBadge kind="job" value={detail.status} />
        {pendingApprovals.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" /> {pendingApprovals.length} pending customer approval{pendingApprovals.length > 1 ? "s" : ""}
          </span>
        )}
        <div className="flex-1" />
        <JobActions jobId={detail.id} status={detail.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* customer & bike */}
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={"/workshop/customers/" + detail.customerId} className="font-semibold hover:text-primary">{detail.customer.name}</Link>
                <div className="text-xs text-muted-foreground">{detail.customer.phone ?? "—"}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{detail.motorcycle.brand} {detail.motorcycle.model}</div>
                <div className="text-xs text-muted-foreground">{detail.motorcycle.plate} · {detail.motorcycle.year} · <strong>{fmtKM(detail.mileage)}</strong></div>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Service</div>
                <div className="font-medium mt-0.5">{detail.packageName ?? "—"}</div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Mechanic</div>
                <div className="font-medium mt-0.5">{detail.mechanic?.name ?? "Unassigned"}</div>
              </div>
              {detail.customerRequest && (
                <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Customer Request</div>
                  <div className="font-medium mt-0.5">“{detail.customerRequest}”</div>
                </div>
              )}
            </div>
          </section>

          {/* items & parts */}
          <section className="rounded-2xl border bg-card">
            <div className="px-5 pt-4 pb-2 font-semibold">Job Lines</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-y bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2 font-medium">Description</th><th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Price</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2" />
                </tr></thead>
                <tbody>
                  {detail.items.map((i) => (
                    <tr key={i.id} className="border-b last:border-0">
                      <td className="px-5 py-2.5">{i.description}</td>
                      <td className="px-3 py-2.5 tabular-nums">{i.quantity}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatRM(i.unitPriceSen)}</td>
                      <td className="px-3 py-2.5"><span className={"text-[11px] font-semibold uppercase " + (i.status === "INCLUDED" ? "text-slate-500" : i.status === "ACCEPTED" ? "text-emerald-600" : i.status === "DECLINED" ? "text-red-500 line-through" : "text-amber-600")}>{i.status}</span></td>
                      <td className="px-3 py-2.5"><RecommendationActions jobId={detail.id} kind="item" id={i.id} status={i.status} /></td>
                    </tr>
                  ))}
                  {detail.parts.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-5 py-2.5">{p.product.name}<div className="text-xs text-muted-foreground">Part · SKU {p.product.sku}</div></td>
                      <td className="px-3 py-2.5 tabular-nums">{p.quantity}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatRM(p.unitPriceSen)}</td>
                      <td className="px-3 py-2.5"><span className={"text-[11px] font-semibold uppercase " + (p.status === "INCLUDED" ? "text-slate-500" : p.status === "ACCEPTED" ? "text-emerald-600" : p.status === "DECLINED" ? "text-red-500 line-through" : "text-amber-600")}>{p.status}</span></td>
                      <td className="px-3 py-2.5"><RecommendationActions jobId={detail.id} kind="part" id={p.id} status={p.status} /></td>
                    </tr>
                  ))}
                  {detail.items.length === 0 && detail.parts.length === 0 && (
                    <tr><td className="px-5 py-4 text-sm text-muted-foreground">No lines yet — add a package or accept recommendations.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between border-t px-5 py-3 text-sm">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="font-bold tabular-nums">{formatRM(detail.summary.totalSen)}</span>
            </div>
          </section>

          {/* AI recommendations */}
          {recs.length > 0 && (
            <section className="rounded-2xl border bg-card p-5">
              <h3 className="font-semibold mb-3">AI Sales Recommendations</h3>
              <div className="space-y-3">
                {recs.map((r) => (
                  <div key={r.description} className="rounded-xl border p-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">{r.description}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.reason}</div>
                      </div>
                      <div className="text-sm font-bold tabular-nums">{formatRM(r.priceSen)}</div>
                    </div>
                    <p className="mt-2 rounded-lg bg-primary/5 p-2.5 text-xs italic text-muted-foreground">“{r.script}”</p>
                    <div className="mt-2"><AiRecommendationActions jobId={detail.id} rec={r} /></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* checklist */}
          {checklist && (
            <section className="rounded-2xl border bg-card">
              <div className="px-5 pt-4 pb-2 font-semibold flex items-center justify-between">
                <span>Inspection Checklist</span>
                {checklist.completedAt ? <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> Completed {fmtDate(checklist.completedAt)}</span> : <span className="text-xs text-muted-foreground">In progress</span>}
              </div>
              <div className="px-5 pb-4 grid sm:grid-cols-2 gap-2">
                {checklist.items.map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                    <span>{i.name}</span>
                    <span className={"text-[11px] font-bold uppercase " + (i.result === "PASS" ? "text-emerald-600" : i.result === "WARNING" ? "text-amber-600" : i.result === "FAIL" ? "text-red-600" : "text-muted-foreground")}>{i.result}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-5">
          {/* approvals */}
          <section className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Customer Approvals</h3>
            {detail.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inspection findings yet.</p>
            ) : (
              <div className="space-y-3">
                {detail.findings.map((f) => (
                  <div key={f.id} className="rounded-xl border p-3.5">
                    <div className="flex items-center justify-between">
                      <span className={"text-[11px] font-bold uppercase " + (f.severity === "WARNING" ? "text-amber-600" : "text-red-600")}>{f.severity}</span>
                      {f.approval && (
                        <span className={"inline-flex items-center gap-1 text-[11px] font-semibold " + (f.approval.status === "PENDING" ? "text-amber-600" : f.approval.status === "APPROVED" ? "text-emerald-600" : "text-red-500")}>
                          {f.approval.status === "PENDING" ? "WAITING CUSTOMER" : f.approval.status === "APPROVED" ? <><CheckCircle2 className="h-3.5 w-3.5" /> CUSTOMER APPROVED</> : <><XCircle className="h-3.5 w-3.5" /> CUSTOMER DECLINED</>}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 font-semibold text-sm">{f.title}</div>
                    {f.note && <p className="text-xs text-muted-foreground mt-0.5">{f.note}</p>}
                    {f.recommendedRepair && (
                      <div className="mt-2 rounded-lg bg-primary/5 p-2 text-xs">
                        <span className="font-semibold">{f.recommendedRepair}</span> · <span className="font-bold tabular-nums">{formatRM(f.priceSen ?? 0)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* invoice */}
          {detail.invoice && (
            <section className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Invoice</h3>
                <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-bold " + (detail.invoice.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{detail.invoice.status}</span>
              </div>
              <div className="font-mono text-sm">{detail.invoice.invoiceNumber}</div>
              <div className="mt-3 space-y-1.5 text-sm">
                {detail.invoice.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-xs"><span>{it.description} ×{it.quantity}</span><span className="tabular-nums">{formatRM(it.lineTotalSen)}</span></div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span>Total</span><span className="tabular-nums">{formatRM(detail.invoice.totalSen)}</span></div>
                {detail.invoice.paidAt && <div className="text-xs text-muted-foreground pt-1">Paid {fmtDate(detail.invoice.paidAt)}</div>}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
