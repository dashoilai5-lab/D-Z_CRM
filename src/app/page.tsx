import Link from "next/link";
import { Bike, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { WorkshopOSEntry } from "@/components/workshop-os-entry";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export default async function LandingPage() {
  const lang = await getLang();
  const org = await db.organisation.findFirst();
  const [customers, jobs, revenue] = await Promise.all([
    db.customer.count(),
    db.serviceJob.count(),
    db.invoice.aggregate({ _sum: { totalSen: true }, where: { status: { not: "DRAFT" } } }),
  ]);
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
            <Bike className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <h1 className="text-2xl font-bold tracking-tight">D&Z PLATFORM</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{org?.name ?? "D&Z Smart Workshop"}</p>
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mt-6">
          {t("home.hero_pre", lang)}<span className="text-primary font-semibold">{t("home.hero_word", lang)}</span>{t("home.hero_post", lang)}
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
          {t("home.sub", lang)}
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          <WorkshopOSEntry />
          <Link href="/rider/home" className="group rounded-3xl border bg-card p-7 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-6 w-6" /></div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-semibold mt-5">D&Z Rider</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("home.rider_desc", lang)}</p>
            <div className="mt-4 text-sm font-medium text-primary">{t("home.open_rider", lang)}</div>
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Link href="/catalogue" className="group rounded-2xl border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-5 w-5" /></div>
            <h3 className="font-semibold mt-3">{t("home.catalogue_title", lang)}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("home.catalogue_desc", lang)}</p>
          </Link>
          <Link href="/test-ride" className="group rounded-2xl border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Clock className="h-5 w-5" /></div>
            <h3 className="font-semibold mt-3">{t("home.testride_title", lang)}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("home.testride_desc", lang)}</p>
          </Link>
          <Link href="/contact" className="group rounded-2xl border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><MessageCircle className="h-5 w-5" /></div>
            <h3 className="font-semibold mt-3">{t("home.contact_title", lang)}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("home.contact_desc", lang)}</p>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{customers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("nav.customers", lang)}</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{jobs.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("home.stat_jobs", lang)}</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{formatRM(revenue._sum.totalSen ?? 0)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("home.stat_revenue", lang)}</div>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">D&Z Platform — Workshop OS + Rider</p>
      </div>
    </main>
  );
}
