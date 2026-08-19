import { getDemoCustomer } from "@/lib/demo-customer";
import { BookForm } from "@/components/rider/book-form";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ campaign?: string; promo?: string }> }) {
  const lang = await getLang();
  const { campaign, promo } = await searchParams;
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const bikes = customer.motorcycles.map((m) => ({ id: m.id, brand: m.brand, model: m.model, plate: m.plate, type: m.type }));
  const campaignId = campaign || null;
  const promoName = promo || null;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("rider.book-title", lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{promoName ? t("rider.book-with-promo", lang) + promoName : t("rider.book-sub", lang)}</p>
      </div>
      <BookForm customerId={customer.id} bikes={bikes} campaignId={campaignId} />
    </div>
  );
}
