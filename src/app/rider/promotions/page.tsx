import Link from "next/link";
import { Tag, CalendarPlus, Megaphone, Clapperboard, BookOpen, ChevronRight, ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { isPromoActive } from "@/modules/marketing/promo";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { label: string; icon: typeof Tag; grad: string }> = {
  POSTER: { label: "Posters", icon: Megaphone, grad: "from-sky-500 to-indigo-600" },
  REEL: { label: "Reels", icon: Clapperboard, grad: "from-fuchsia-500 to-purple-600" },
  STORY: { label: "Stories", icon: BookOpen, grad: "from-emerald-500 to-teal-600" },
};

export default async function RiderPromotionsPage() {
  const [campaigns, assets] = await Promise.all([
    db.campaign.findMany({ where: { status: "ACTIVE" }, orderBy: { startDate: "desc" } }),
    db.marketingAsset.findMany({ orderBy: { month: "desc" } }),
  ]);
  const livePromos = campaigns.filter((c) => isPromoActive(c as never));
  const groups = (["POSTER", "REEL", "STORY"] as const)
    .map((t) => ({ type: t, meta: TYPE_META[t], items: assets.filter((a) => a.type === t) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <Link href="/rider/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" /> Home</Link>

      <div>
        <h1 className="text-2xl font-bold">Offers & Materials</h1>
        <p className="text-sm text-muted-foreground mt-1">Current promos and marketing content from D&Z Smart Workshop</p>
      </div>

      {livePromos.length > 0 && (
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="h-4 w-4 text-purple-600" />
            <h2 className="font-semibold">Active Promotions</h2>
          </div>
          <div className="space-y-2">
            {livePromos.map((p) => (
              <Link
                key={p.id}
                href={"/rider/book?campaign=" + p.id + "&promo=" + encodeURIComponent(p.name)}
                className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white p-4 hover:opacity-95 transition-opacity"
              >
                <div>
                  <div className="font-semibold">{p.name}</div>
                  {p.discountPercent && <div className="mt-0.5 text-xs opacity-90">Save {p.discountPercent}% on selected services</div>}
                </div>
                {p.discountPercent && (
                  <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-sm font-bold">−{p.discountPercent}%</span>
                )}
              </Link>
            ))}
          </div>
          {livePromos[0] && (
            <Link href={"/rider/book?campaign=" + livePromos[0].id + "&promo=" + encodeURIComponent(livePromos[0].name)} className="mt-2 flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold text-primary">
              <CalendarPlus className="h-4 w-4" /> Book with a promotion
            </Link>
          )}
        </section>
      )}

      {groups.map((g) => (
        <section key={g.type}>
          <div className="flex items-center gap-1.5 mb-2">
            <g.meta.icon className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">{g.meta.label}</h2>
            <span className="text-xs text-muted-foreground">({g.items.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {g.items.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-2xl border bg-card">
                <div className={"aspect-[3/4] bg-gradient-to-br flex items-center justify-center " + g.meta.grad}>
                  <g.meta.icon className="h-8 w-8 text-white/80" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold truncate">{a.title}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{a.month ?? ""}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {groups.length === 0 && livePromos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No promotions or materials yet.</p>
      )}

      <div className="flex items-center justify-center gap-1 pt-2 text-[11px] text-muted-foreground">
        <ChevronRight className="h-3 w-3" /> New content posted by the workshop appears here
      </div>
    </div>
  );
}
