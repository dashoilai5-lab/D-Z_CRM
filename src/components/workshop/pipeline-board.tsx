"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { updateLead } from "@/actions/leads";
import { formatRM } from "@/lib/money";

export interface BoardLead {
  id: string; customerName: string; phone: string | null; valueSen: number;
  source: string; owner: string; stageId: string | null; isStale: boolean; updatedAt: Date;
}
export interface BoardStage { id: string; name: string; count: number; valueSen: number }

export function PipelineBoard({ stages, leads }: { stages: BoardStage[]; leads: BoardLead[] }) {
  const router = useRouter();

  async function move(id: string, stageId: string) {
    await updateLead(id, { stageId: stageId || undefined });
    router.refresh();
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
      {stages.map((s) => {
        const items = leads.filter((l) => l.stageId === s.id);
        return (
          <div key={s.id} className="min-w-[260px] w-[260px] shrink-0 rounded-xl border bg-muted/30 flex flex-col">
            <div className="px-3 py-2.5 border-b bg-card rounded-t-xl flex items-center justify-between">
              <span className="font-semibold text-sm">{s.name}</span>
              <span className="text-xs text-muted-foreground">{items.length} · {formatRM(items.reduce((a, b) => a + b.valueSen, 0))}</span>
            </div>
            <div className="p-2 space-y-2 flex-1">
              {items.map((l) => (
                <div key={l.id} className="rounded-lg border bg-card p-3 space-y-2" data-testid="pipe-card">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={"/workshop/leads/" + l.id} className="font-medium text-sm hover:underline">{l.customerName}</Link>
                    {l.isStale && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 text-[10px] px-1.5 py-0.5">
                        <AlertTriangle className="h-3 w-3" /> stale
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{l.source} · {l.owner}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{l.valueSen > 0 ? formatRM(l.valueSen) : "—"}</span>
                    <select
                      value={l.stageId ?? ""}
                      className="rounded border bg-background px-1.5 py-0.5 text-xs"
                      onChange={(e) => move(l.id, e.target.value)}
                    >
                      <option value="">No stage</option>
                      {stages.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="text-xs text-muted-foreground/60 text-center py-4">No leads</div>}
            </div>
          </div>
        );
      })}
      <div className="min-w-[240px] w-[240px] shrink-0 rounded-xl border border-dashed p-3 text-center text-sm text-muted-foreground">
        {leads.filter((l) => !l.stageId).length} un-staged
      </div>
    </div>
  );
}
