"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, XCircle, Clock, AlertTriangle } from "lucide-react";
import { completeTask, reopenTask, cancelTask } from "@/actions/tasks";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export type TaskItem = {
  id: string; title: string; description: string | null; priority: string; status: string;
  effectiveStatus: string; dueAt: Date | null; relatedType: string | null; relatedId: string | null;
  owner: { id: string; name: string } | null; completedAt: Date | null; completedBy: { id: string; name: string } | null;
};

export function TaskList({ items }: { items: TaskItem[] }) {
  const router = useRouter();
  const lang = useLang();
  const prio = (p: string) => p === "HIGH" ? "bg-rose-500/15 text-rose-600 dark:text-rose-300" : p === "LOW" ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  const prioLabel = (p: string): string => (p === "HIGH" || p === "LOW" || p === "NORMAL") ? t("ws.priority." + p, lang) : p;

  return (
    <div data-tut="tasks-list" className="rounded-xl border bg-card divide-y">
      {items.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t("task-list.empty", lang)}</div>}
      {items.map((task) => (
        <div key={task.id} className="px-4 py-3 flex items-start gap-3 transition-colors hover:bg-muted/30" data-testid="task-row">
          {task.effectiveStatus === "COMPLETED" ? (
            <button onClick={async () => { await reopenTask(task.id); router.refresh(); }} className="mt-0.5 text-emerald-600 dark:text-emerald-300 hover:opacity-70" title={t("task-list.reopen", lang)}><CheckCircle2 className="h-5 w-5" /></button>
          ) : (
            <button onClick={async () => { await completeTask(task.id); router.refresh(); }} className="mt-0.5 text-muted-foreground hover:text-emerald-600" title={t("task-list.complete", lang)}><CheckCircle2 className="h-5 w-5" /></button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={"font-medium text-sm " + (task.effectiveStatus === "OVERDUE" ? "text-destructive" : task.effectiveStatus === "COMPLETED" ? "line-through text-muted-foreground" : "")}>{task.title}</span>
              <span className={"rounded-full text-[10px] px-2 py-0.5 " + prio(task.priority)}>{prioLabel(task.priority)}</span>
              {task.effectiveStatus === "OVERDUE" && <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive"><AlertTriangle className="h-3 w-3" /> {t("tasks.overdue", lang)}</span>}
            </div>
            {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
            <div className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-2 flex-wrap">
              {task.dueAt && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDateTime(task.dueAt)}</span>}
              <span>{t("ws.task.owner", lang)}: {task.owner?.name ?? "—"}</span>
              {task.completedAt && <span>{t("task-list.completed-by", lang)} {task.completedBy?.name ?? "—"} · {fmtDateTime(task.completedAt)}</span>}
              {task.relatedType && <span className="text-muted-foreground/50">#{task.relatedType.toLowerCase()}</span>}
            </div>
          </div>
          {task.effectiveStatus !== "COMPLETED" && (
            <button onClick={async () => { await cancelTask(task.id); router.refresh(); }} className="text-muted-foreground/50 hover:text-destructive" title={t("common.cancel", lang)}><XCircle className="h-4 w-4" /></button>
          )}
        </div>
      ))}
    </div>
  );
}
