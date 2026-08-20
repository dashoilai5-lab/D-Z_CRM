"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, XCircle, Clock, AlertTriangle } from "lucide-react";
import { completeTask, reopenTask, cancelTask } from "@/actions/tasks";
import { fmtDateTime } from "@/lib/format";

export type TaskItem = {
  id: string; title: string; description: string | null; priority: string; status: string;
  effectiveStatus: string; dueAt: Date | null; relatedType: string | null; relatedId: string | null;
  owner: { id: string; name: string } | null; completedAt: Date | null; completedBy: { id: string; name: string } | null;
};

export function TaskList({ items }: { items: TaskItem[] }) {
  const router = useRouter();
  const prio = (p: string) => p === "HIGH" ? "bg-rose-500/15 text-rose-600" : p === "LOW" ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-600";

  return (
    <div className="rounded-xl border bg-card divide-y">
      {items.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">No tasks.</div>}
      {items.map((t) => (
        <div key={t.id} className="px-4 py-3 flex items-start gap-3 transition-colors hover:bg-muted/30" data-testid="task-row">
          {t.effectiveStatus === "COMPLETED" ? (
            <button onClick={async () => { await reopenTask(t.id); router.refresh(); }} className="mt-0.5 text-emerald-600 hover:opacity-70" title="Reopen"><CheckCircle2 className="h-5 w-5" /></button>
          ) : (
            <button onClick={async () => { await completeTask(t.id); router.refresh(); }} className="mt-0.5 text-muted-foreground hover:text-emerald-600" title="Complete"><CheckCircle2 className="h-5 w-5" /></button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={"font-medium text-sm " + (t.effectiveStatus === "OVERDUE" ? "text-destructive" : t.effectiveStatus === "COMPLETED" ? "line-through text-muted-foreground" : "")}>{t.title}</span>
              <span className={"rounded-full text-[10px] px-2 py-0.5 " + prio(t.priority)}>{t.priority}</span>
              {t.effectiveStatus === "OVERDUE" && <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive"><AlertTriangle className="h-3 w-3" /> overdue</span>}
            </div>
            {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
            <div className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-2 flex-wrap">
              {t.dueAt && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDateTime(t.dueAt)}</span>}
              <span>Owner: {t.owner?.name ?? "—"}</span>
              {t.completedAt && <span>✓ by {t.completedBy?.name ?? "—"} · {fmtDateTime(t.completedAt)}</span>}
              {t.relatedType && <span className="text-muted-foreground/50">#{t.relatedType.toLowerCase()}</span>}
            </div>
          </div>
          {t.effectiveStatus !== "COMPLETED" && (
            <button onClick={async () => { await cancelTask(t.id); router.refresh(); }} className="text-muted-foreground/50 hover:text-destructive" title="Cancel"><XCircle className="h-4 w-4" /></button>
          )}
        </div>
      ))}
    </div>
  );
}
