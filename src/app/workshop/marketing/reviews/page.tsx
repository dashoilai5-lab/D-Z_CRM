import { PageHeader } from "@/components/shared/page-header";
import { crmService } from "@/modules/crm/service";
import { ReviewManager } from "@/components/workshop/review-manager";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const lang = await getLang();
  const reviews = await crmService.reviews();
  return (
    <div>
      <PageHeader
        title={t("ws.mkt.reviews.title", lang)}
        subtitle={[
          t("ws.mkt.reviews.avg", lang).replace("{r}", reviews.avg.toFixed(1)).replace("{n}", String(reviews.count)),
          t("ws.mkt.reviews.sub", lang),
        ].join(" · ")}
      />
      <ReviewManager
        reviews={reviews.list.map((r) => ({
          id: r.id, customer: r.customer, rating: r.rating, comment: r.comment, source: r.source, status: r.status,
          reply: r.reply, repliedAt: r.repliedAt, createdAt: r.createdAt,
        }))}
      />
    </div>
  );
}
