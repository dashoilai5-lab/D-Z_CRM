import { PageHeader } from "@/components/shared/page-header";
import { crmService } from "@/modules/crm/service";
import { fmtDate } from "@/lib/format";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await crmService.reviews();
  return (
    <div>
      <PageHeader title="Reviews" subtitle={"Average rating " + reviews.avg.toFixed(1) + " ★ across " + reviews.count + " reviews"} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {reviews.list.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{r.customer}</span>
              {r.rating && <span className="flex items-center gap-0.5 text-amber-500 text-sm"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{r.rating}</span>}
            </div>
            {r.comment && <p className="mt-2 text-sm text-muted-foreground">“{r.comment}”</p>}
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{r.source} · {fmtDate(r.createdAt)}</span>
              <span className={"rounded-full px-2 py-0.5 font-semibold " + (r.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
