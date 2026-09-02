import { Bike, CalendarDays, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { TestRideForm } from "@/components/public/test-ride-form";
import { getLang } from "@/lib/get-lang";
import { t, tpl } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function TestRidePage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const org = await db.organisation.findFirst();
  const branches = await db.branch.findMany({ where: { organisationId: org!.id } });
  const slots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-2 font-bold text-lg">
          <Bike className="h-6 w-6 text-primary" /> {org?.name ?? "D&Z Motors"} — {t("testride.title", lang)}
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6 grid md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-3xl font-bold">{t("testride.title", lang)}</h1>
          <p className="text-muted-foreground mt-2">{t("testride.subtitle", lang)}</p>
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {t("testride.any_weekday", lang)}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {tpl("testride.slots", lang, { slots: slots.join(", ") })}</div>
          </div>
        </div>
        <TestRideForm defaultModel={sp.model} branches={branches.map((b) => ({ id: b.id, label: b.name + " · " + b.city }))} slots={slots} />
      </div>
    </main>
  );
}
