import Link from "next/link";
import { getDemoCustomer } from "@/lib/demo-customer";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { fmtKM } from "@/lib/format";
import { ReviewCard } from "@/components/rider/review-card";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function RiderHistoryPage() {
  const lang = await getLang();
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const [jobs, branch] = await Promise.all([
    db.serviceJob.findMany({
      where: { customerId: customer.id, status: "COMPLETED" },
      include: { invoice: true, items: true, parts: { include: { product: true } }, mechanic: true, motorcycle: true },
      orderBy: { completedAt: "desc" },
    }),
    db.branch.findFirst({ where: { isMain: true } }),
  ]);
  const lifetime = jobs.reduce((s, j) => s + (j.invoice?.totalSen ?? 0), 0);
  const reviews = await db.review.findMany({ where: { customerId: customer.id, jobId: { not: null } }, select: { jobId: true, rating: true } });
  const ratingByJob = new Map(reviews.filter((r) => r.jobId).map((r) => [r.jobId!, r.rating]));

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">{t("rider.service-history", lang)}</h1>
        <span className="text-xs text-muted-foreground">{t("rider.lifetime", lang)} <strong className="text-foreground tabular-nums">{formatRM(lifetime)}</strong></span>
      </div>
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold tracking-wide">{j.completedAt ? j.completedAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : ""}</span>
              <span className="text-muted-foreground tabular-nums">{fmtKM(j.mileage)} · {j.motorcycle.plate}</span>
            </div>
            <div className="mt-1 font-semibold">{j.packageName ?? t("rider.general-service", lang)} <span className="text-xs font-normal text-muted-foreground">· {j.jobNumber}</span></div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {j.items.filter((i) => i.unitPriceSen === 0).slice(0, 5).map((i) => (
                <span key={i.id} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">✓ {i.description}</span>
              ))}
              {j.parts.map((p) => (
                <span key={p.id} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">✓ {p.product.name} ×{p.quantity}</span>
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>D&Z Smart Workshop · {j.mechanic?.name ?? ""}</span>
              <Link href={j.invoice ? "/rider/invoices" : "#"} className="font-bold text-foreground tabular-nums hover:text-primary">{formatRM(j.invoice?.totalSen ?? 0)}</Link>
            </div>
            {branch && (
              <ReviewCard customerId={customer.id} branchId={branch.id} jobId={j.id} existingRating={ratingByJob.get(j.id) ?? null} />
            )}
          </div>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("rider.no-history", lang)}</p>}
      </div>
    </div>
  );
}
