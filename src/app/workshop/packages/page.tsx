import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { PackageEditor } from "@/components/workshop/package-editor";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const lang = await getLang();
  const org = await db.organisation.findFirst();
  const packages = await db.servicePackage.findMany({ include: { items: true }, orderBy: { priceSen: "asc" } });
  const [serviceTypes, products] = await Promise.all([
    db.serviceType.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { name: "asc" } }),
    db.product.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { name: "asc" }, take: 30 }),
  ]);
  const candidates = [
    ...serviceTypes.map((s) => ({ name: s.name, kind: "SERVICE" as const, source: "service" })),
    ...products.map((p) => ({ name: p.name, kind: "PART" as const, source: "part" })),
  ];
  // free-text items already used in any package (e.g. "Engine Oil") so existing selections stay tickable
  const usedNames = [...new Set(packages.flatMap((p) => p.items.map((i) => i.name)))];
  const existingOnly = usedNames
    .filter((n) => !candidates.some((c) => c.name === n))
    .map((name) => ({ name, kind: "SERVICE" as const, source: "existing" }));
  const allCandidates = [...candidates, ...existingOnly];
  // duplicate detection: item name → names of OTHER packages containing it
  const dupMap: Record<string, string[]> = {};
  for (const p of packages) {
    for (const i of p.items) {
      const others = packages.filter((x) => x.id !== p.id && x.items.some((it) => it.name === i.name)).map((x) => x.name);
      if (others.length > 0) dupMap[i.name] = [...new Set(others)];
    }
  }

  return (
    <div>
      <PageHeader title={t("ws.packages.title", lang)} subtitle={t("ws.packages.subtitle", lang)} />
      <div className="grid md:grid-cols-3 gap-4">
        {packages.map((p) => (
          <div key={p.id} className={"rounded-3xl border p-6 flex flex-col " + (p.isBestValue ? "border-primary ring-2 ring-primary/20" : "bg-card")}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{p.tier}</span>
              <div className="flex items-center gap-1.5">
                {p.isBestValue && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200">{t("ws.packages.best-value", lang)}</Badge>}
                {!p.active && <Badge className="bg-muted text-muted-foreground">Inactive</Badge>}
              </div>
            </div>
            <h3 className="mt-2 text-xl font-bold">{p.name}</h3>
            <div className="mt-2 text-3xl font-bold tabular-nums">{formatRM(p.priceSen)}</div>
            {p.description && <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>}
            <ul className="mt-4 space-y-1.5 text-sm flex-1">
              {p.items.map((i) => {
                const dups = dupMap[i.name] ?? [];
                return (
                  <li key={i.id} className="flex items-center gap-2 flex-wrap">
                    <span className="text-emerald-600 dark:text-emerald-300">{i.kind === "GIFT" ? "🎁" : "✓"}</span> {i.name}
                    {i.kind === "GIFT" && <span className="rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300 text-[10px] px-1.5 py-0.5 font-semibold">FREE</span>}
                    {dups.length > 0 && (
                      <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 font-medium">
                        ⚠ also in {dups.join(", ")}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 pt-3 border-t">
              <PackageEditor
                pkg={{ id: p.id, name: p.name, tier: p.tier, priceSen: p.priceSen, description: p.description, isBestValue: p.isBestValue, active: p.active, items: p.items.map((i) => ({ id: i.id, name: i.name, kind: i.kind, defaultQty: i.defaultQty, priceSen: i.priceSen, productId: i.productId })) }}
                candidates={allCandidates}
                dupMap={dupMap}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
