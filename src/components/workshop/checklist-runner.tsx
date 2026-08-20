"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { setChecklistResult, startChecklist, requestApproval } from "@/actions/mechanic";
import { transitionJob } from "@/actions/workshop";

export interface ChecklistItemDto { id: string; name: string; result: string; note: string | null }
export interface FindingDto { id: string; title: string; severity: string; note: string | null; recommendedRepair: string | null; priceSen: number | null; status: string; approvalStatus?: string }

export function ChecklistRunner({
  jobId, jobNumber, items, findings, hasChecklist, status,
}: {
  jobId: string; jobNumber: string; items: ChecklistItemDto[]; findings: FindingDto[]; hasChecklist: boolean; status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<Record<string, string>>({});
  const [repair, setRepair] = useState<Record<string, string>>({});
  const [price, setPrice] = useState<Record<string, string>>({});
  const [approvalPanel, setApprovalPanel] = useState<string | null>(null);

  const setResult = (itemId: string, result: string) =>
    start(async () => {
      await setChecklistResult(jobId, itemId, result as never, note[itemId] || undefined);
      router.refresh();
      toast.success("Checklist updated");
    });

  const submitApproval = (itemId: string, title: string) => {
    const r = repair[itemId];
    const p = Number(price[itemId]);
    if (!r || !p) { toast.error("Recommended repair and price are required"); return; }
    start(async () => {
      await requestApproval({ jobId, executionItemId: itemId, title, severity: "WARNING", note: note[itemId] ?? "Found during inspection.", recommendedRepair: r, priceSen: Math.round(p * 100) });
      router.refresh();
      setApprovalPanel(null);
      toast.success("Approval requested — customer will see it in the Rider app");
    });
  };

  const complete = () =>
    start(async () => {
      try {
        const r = await transitionJob(jobId, "COMPLETED");
        router.refresh();
        if (r.ok && r.result) toast.success("Service completed — invoice " + r.result.invoiceNumber + " · GP " + "RM" + (r.result.grossProfitSen / 100));
      } catch (e) { toast.error((e as Error).message); }
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
        <div>
          <div className="font-mono text-xs text-muted-foreground">JOB</div>
          <div className="font-bold">#{jobNumber}</div>
        </div>
        <div className="flex gap-2">
          {(status === "IN_PROGRESS" || status === "AWAITING_APPROVAL") && (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { await transitionJob(jobId, "READY"); router.refresh(); toast.success("Marked ready"); })}>Mark Ready</Button>
          )}
          {(status === "READY" || status === "IN_PROGRESS" || status === "AWAITING_APPROVAL") && (
            <Button size="sm" disabled={pending} onClick={complete} data-testid="complete-service">Complete Service</Button>
          )}
        </div>
      </div>

      {!hasChecklist && (
        <Button className="w-full" data-testid="start-checklist" onClick={() => start(async () => { await startChecklist(jobId); router.refresh(); })} disabled={pending}>
          Start Inspection Checklist
        </Button>
      )}

      {hasChecklist && (
        <div className="space-y-2.5">
          {items.map((item) => {
            const active = approvalPanel === item.id;
            const approved = item.result === "PASS" || item.result === "FAIL" || item.result === "WARNING" || item.result === "NA";
            const result = item.result;
            return (
              <div key={item.id} data-testid={"check-" + item.name.replace(/\s+/g, "-")} className={"rounded-2xl border bg-card p-4 " + (result === "WARNING" ? "border-amber-300" : result === "FAIL" ? "border-red-300" : "")}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={"h-2 w-2 rounded-full " + (result === "PASS" ? "bg-emerald-500" : result === "WARNING" ? "bg-amber-500" : result === "FAIL" ? "bg-red-500" : "bg-slate-300")} />
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.note && <span className="text-xs text-muted-foreground">· {item.note}</span>}
                  </div>
                  <div className="flex gap-1">
                    {["PASS", "WARNING", "FAIL", "NA"].map((opt) => (
                      <button key={opt} data-testid={"result-" + item.name.replace(/\s+/g, "-") + "-" + opt} onClick={() => setResult(item.id, opt)}
                        className={"rounded-md px-2 py-1 text-[11px] font-bold uppercase transition-colors " +
                          (result === opt ? (opt === "PASS" ? "bg-emerald-600 text-white" : opt === "WARNING" ? "bg-amber-500 text-white" : opt === "FAIL" ? "bg-red-600 text-white" : "bg-slate-400 text-white") : "bg-muted text-muted-foreground hover:bg-muted/70")}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {(result === "WARNING" || result === "FAIL") && (
                  <div className="mt-3 rounded-xl bg-muted/50 p-3">
                    <Input placeholder="Mechanic note (e.g. Chain is too loose)" value={note[item.id] ?? ""} onChange={(e) => setNote((n) => ({ ...n, [item.id]: e.target.value }))} className="bg-background h-8 text-sm" />
                    {!active ? (
                      <Button size="sm" variant="outline" className="mt-2" data-testid={"approval-request-" + item.name.replace(/\s+/g, "-")} onClick={() => setApprovalPanel(item.id)}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Request Customer Approval
                      </Button>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px]">Recommended Repair</Label>
                            <Input value={repair[item.id] ?? ""} onChange={(e) => setRepair((n) => ({ ...n, [item.id]: e.target.value }))} placeholder="Chain Adjustment" className="bg-background h-8 text-sm mt-0.5" />
                          </div>
                          <div>
                            <Label className="text-[11px]">Price (RM)</Label>
                            <Input inputMode="decimal" value={price[item.id] ?? ""} onChange={(e) => setPrice((n) => ({ ...n, [item.id]: e.target.value }))} placeholder="20" className="bg-background h-8 text-sm mt-0.5" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" data-testid="approval-send" onClick={() => submitApproval(item.id, item.name)} disabled={pending}>Send Request</Button>
                          <Button size="sm" variant="ghost" onClick={() => setApprovalPanel(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {findings.length > 0 && (
        <div className="rounded-2xl border bg-card p-4">
          <h3 className="font-semibold mb-3">Findings &amp; Approvals</h3>
          <div className="space-y-2">
            {findings.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-sm">
                <div>
                  <div className="font-medium">{f.title} <span className={"text-[10px] font-bold uppercase " + (f.severity === "WARNING" ? "text-amber-600 dark:text-amber-300" : "text-red-600 dark:text-red-300")}>({f.severity})</span></div>
                  {f.recommendedRepair && <div className="text-xs text-muted-foreground">{f.recommendedRepair} · RM{((f.priceSen ?? 0) / 100).toFixed(2)}</div>}
                </div>
                {f.approvalStatus === "PENDING" && <span className="text-xs font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> WAITING CUSTOMER</span>}
                {f.approvalStatus === "APPROVED" && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> CUSTOMER APPROVED</span>}
                {f.approvalStatus === "DECLINED" && <span className="text-xs font-semibold text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> CUSTOMER DECLINED</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
