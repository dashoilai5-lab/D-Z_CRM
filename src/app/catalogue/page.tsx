import Link from "next/link";
import { Search, Bike, Phone, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { BIKE_BRANDS, BRAND_MODEL_MAP } from "@/lib/bike-models";
import { formatRM } from "@/lib/money";
import { PendingForm } from "@/components/shared/search-form";

export const dynamic = "force-dynamic";

export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ brand?: string; q?: string }> }) {
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const branches = await db.branch.findMany({ where: { organisationId: org!.id } });
  const brand = sp.brand && (BIKE_BRANDS as readonly string[]).includes(sp.brand) ? sp.brand : "Yamaha";
  const q = sp.q?.toLowerCase() ?? "";
  const models = (BRAND_MODEL_MAP[brand] ?? []).filter((m) => !q || m.toLowerCase().includes(q));
  // sample catalogue prices by model tier (demo placeholder — real pricing from dealer catalogue)
  const priceFor = (m: string) => 8200 + ((m.charCodeAt(0) + m.length) % 28) * 480;

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Bike className="h-6 w-6 text-primary" /> {org?.name ?? "D&Z Motors"}
          </Link>
          <a href={"https://wa.me/60" + (org?.contactPhone?.replace(/\D/g, "").slice(1) ?? "123456789")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Motorcycle Catalogue</h1>
          <p className="text-muted-foreground mt-1">Browse available models across {branches.length} branches. Enquire and we&apos;ll get back to you.</p>
        </div>

        <PendingForm className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input name="q" defaultValue={sp.q} placeholder="Search models…" className="w-full rounded-lg border bg-background pl-8 pr-3 py-2 text-sm" />
          </div>
          <select name="brand" defaultValue={brand} className="rounded-lg border bg-background px-3 py-2 text-sm">
            {BIKE_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Go</button>
        </PendingForm>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {models.map((m) => {
            if (m === "Others") return null;
            const price = priceFor(m);
            return (
              <div key={m} className="rounded-xl border bg-card p-4 flex flex-col">
                <div className="aspect-[4/3] rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground/60"><Bike className="h-10 w-10" /></div>
                <div className="mt-3 font-semibold">{brand} {m}</div>
                <div className="text-xs text-muted-foreground mt-0.5">From {formatRM(price * 100)}</div>
                <div className="mt-1"><span className="inline-flex rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-[11px] px-2 py-0.5">In stock</span></div>
                <Link href={"/contact?model=" + encodeURIComponent(brand + " " + m)} className="mt-3 rounded-lg border text-center py-1.5 text-sm font-medium hover:bg-accent">
                  Enquire
                </Link>
              </div>
            );
          })}
        </div>
        {models.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No models match.</p>}
      </div>
    </main>
  );
}
