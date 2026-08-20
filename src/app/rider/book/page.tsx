import { getDemoCustomer } from "@/lib/demo-customer";
import { BookForm } from "@/components/rider/book-form";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ campaign?: string; promo?: string }> }) {
  const lang = await getLang();
  const { campaign, promo } = await searchParams;
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const bikes = customer.motorcycles.map((m) => ({ id: m.id, brand: m.brand, model: m.model, plate: m.plate, type: m.type }));
  // packages (GOOD/BETTER/BEST) — mirror of the workshop counter selection
  const packages = await db.servicePackage.findMany({
    where: { active: true },
    select: { id: true, name: true, tier: true, priceSen: true, isBestValue: true, description: true },
    orderBy: { priceSen: "asc" },
  });
  const campaignId = campaign || null;
  const promoName = promo || null;
  // BOOK-006/007/008: only offer configured, non-full slots (branch = main)
  const mainBranch = await db.branch.findFirst({ where: { organisationId: customer.organisationId, isMain: true } });
  const future = new Date(Date.now() + 14 * 86400000);
  const slots = mainBranch
    ? await db.appointmentSlot.findMany({
        where: { branchId: mainBranch.id, date: { gte: new Date(), lte: future }, isHoliday: false },
        select: { date: true, startTime: true, bookedCount: true, maxBookings: true },
      })
    : [];
  const availableSlots = slots
    .filter((s) => s.bookedCount < s.maxBookings)
    .map((s) => ({ date: s.date.toISOString().slice(0, 10), time: s.startTime }));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("rider.book-title", lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{promoName ? t("rider.book-with-promo", lang) + promoName : t("rider.book-sub", lang)}</p>
      </div>
      <BookForm
        customerId={customer.id}
        bikes={bikes}
        packages={packages.map((p) => ({ id: p.id, name: p.name, tier: p.tier, priceSen: p.priceSen, isBestValue: p.isBestValue, description: p.description }))}
        campaignId={campaignId}
        availableSlots={availableSlots}
      />
    </div>
  );
}
