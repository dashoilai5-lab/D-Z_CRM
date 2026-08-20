"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Check, MessageSquare, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { publishReview, replyToReview } from "@/actions/marketing";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export interface ReviewRow {
  id: string; customer: string; rating: number | null; comment: string | null; source: string; status: string;
  reply: string | null; repliedAt: Date | null; createdAt: Date;
}

export function ReviewManager({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<"ALL" | "SUBMITTED" | "PUBLISHED" | "APP" | "GOOGLE">("ALL");
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = reviews.filter((r) => {
    if (filter === "SUBMITTED") return r.status === "SUBMITTED";
    if (filter === "PUBLISHED") return r.status === "PUBLISHED";
    if (filter === "APP" || filter === "GOOGLE") return r.source === filter;
    return true;
  });

  const publish = (id: string) =>
    start(async () => { await publishReview(id); router.refresh(); toast.success(t("toast.review-published", lang)); });

  const submitReply = (id: string) =>
    start(async () => {
      if (!replyText.trim()) { toast.error(t("toast.write-reply", lang)); return; }
      await replyToReview(id, replyText.trim());
      setReplying(null); setReplyText("");
      router.refresh();
      toast.success(t("toast.reply-posted", lang));
    });

  const filters: { key: typeof filter; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "SUBMITTED", label: "Pending" },
    { key: "PUBLISHED", label: "Published" },
    { key: "APP", label: "App" },
    { key: "GOOGLE", label: "Google" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", filter === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/40")}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-card p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{r.customer}</span>
              {r.rating && <span className="flex items-center gap-0.5 text-amber-500 text-sm"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{r.rating}</span>}
            </div>
            {r.comment && <p className="mt-2 text-sm text-muted-foreground">“{r.comment}”</p>}
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{r.source} · {fmtDate(r.createdAt)}</span>
              <span className={"rounded-full px-2 py-0.5 font-semibold " + (r.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300")}>{r.status}</span>
            </div>

            {r.reply && (
              <div className="mt-3 rounded-xl bg-primary/5 p-3 text-xs">
                <div className="flex items-center gap-1 font-semibold text-primary mb-1"><Reply className="h-3 w-3" /> Workshop reply</div>
                <p className="text-muted-foreground">{r.reply}</p>
              </div>
            )}

            <div className="mt-auto pt-3 space-y-2">
              {replying === r.id ? (
                <div className="space-y-2">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a public reply…" rows={2} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring" />
                  <div className="flex gap-2">
                    <button onClick={() => { setReplying(null); setReplyText(""); }} className="flex-1 rounded-lg border py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
                    <button onClick={() => submitReply(r.id)} disabled={pending} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">Post Reply</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {r.status !== "PUBLISHED" && (
                    <button onClick={() => publish(r.id)} disabled={pending} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40">
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" /> Publish
                    </button>
                  )}
                  <button onClick={() => setReplying(r.id)} disabled={pending} className={cn("inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium", r.status === "PUBLISHED" ? "flex-1 bg-primary text-primary-foreground" : "flex-1 border hover:bg-muted")}>
                    <MessageSquare className="h-3.5 w-3.5" /> {r.reply ? "Edit Reply" : "Reply"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-10 col-span-full">No reviews in this filter.</p>}
      </div>
    </div>
  );
}
