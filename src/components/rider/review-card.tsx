"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReview } from "@/actions/rider";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function ReviewCard({ customerId, branchId, jobId, existingRating }: { customerId: string; branchId: string; jobId: string; existingRating: number | null }) {
  const router = useRouter();
  const lang = useLang();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  if (existingRating) {
    return (
      <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={cn("h-3.5 w-3.5", s <= existingRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">{t("svc.review-thanks", lang)}</span>
      </div>
    );
  }

  const submit = () =>
    start(async () => {
      if (rating === 0) { toast.error(t("toast.pick-rating", lang)); return; }
      await submitReview({ customerId, branchId, jobId, rating, comment: comment || undefined });
      setOpen(false);
      router.refresh();
      toast.success(t("toast.review-thanks", lang));
    });

  return (
    <div className="mt-2.5">
      <button onClick={() => setOpen(true)} className="rounded-xl bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
        Rate this service ★
      </button>
      {open && (
        <div className="mt-2 rounded-xl border p-3 space-y-2.5">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)} aria-label={s + " stars"} className="p-0.5">
                <Star className={cn("h-6 w-6 transition-colors", (hover || rating) >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
              </button>
            ))}
          </div>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the service? (optional)"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border py-2 text-xs font-medium hover:bg-muted">{t("common.cancel-short", lang)}</button>
            <button onClick={submit} disabled={pending || rating === 0} className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
              {pending ? "Sending…" : "Submit review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
