import Link from "next/link";
import { Bike, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/money";
import { getPersona } from "@/lib/demo";
import { WorkshopOSEntry } from "@/components/workshop-os-entry";

export default async function LandingPage() {
  const persona = await getPersona();
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
          The workshop and the rider, <span className="text-primary font-semibold">connected</span>.
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
          One shared business system. Two experiences — D&Z Workshop OS for the team, D&Z Rider for motorcycle owners.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          <WorkshopOSEntry persona={persona} />
          <Link href="/rider/home" className="group rounded-3xl border bg-card p-7 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-6 w-6" /></div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-semibold mt-5">D&Z Rider</h3>
            <p className="text-sm text-muted-foreground mt-1">One digital home for your motorcycle — book, track, approve, history.</p>
            <div className="mt-4 text-sm font-medium text-primary">Open Rider App →</div>
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Link href="/catalogue" className="group rounded-2xl border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-5 w-5" /></div>
            <h3 className="font-semibold mt-3">Motorcycle Catalogue</h3>
            <p className="text-xs text-muted-foreground mt-1">Browse new bikes across our branches.</p>
          </Link>
          <Link href="/test-ride" className="group rounded-2xl border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Clock className="h-5 w-5" /></div>
            <h3 className="font-semibold mt-3">Book a Test Ride</h3>
            <p className="text-xs text-muted-foreground mt-1">Try before you buy — pick a slot.</p>
          </Link>
          <Link href="/contact" className="group rounded-2xl border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><MessageCircle className="h-5 w-5" /></div>
            <h3 className="font-semibold mt-3">Contact / Enquire</h3>
            <p className="text-xs text-muted-foreground mt-1">Questions? We reply fast on WhatsApp.</p>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{customers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Customers</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{jobs.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Service jobs</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{formatRM(revenue._sum.totalSen ?? 0)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Lifetime revenue</div>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">DEMO MODE — shared local database · reset any time from the top bar</p>
      </div>
    </main>
  );
}
