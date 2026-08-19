import { PageHeader } from "@/components/shared/page-header";
import { crmService } from "@/modules/crm/service";
import { ReviewManager } from "@/components/workshop/review-manager";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await crmService.reviews();
  return (
    <div>
      <PageHeader title="Reviews" subtitle={"Average rating " + reviews.avg.toFixed(1) + " ★ across " + reviews.count + " reviews · publish & reply to manage reputation"} />
      <ReviewManager
        reviews={reviews.list.map((r) => ({
          id: r.id, customer: r.customer, rating: r.rating, comment: r.comment, source: r.source, status: r.status,
          reply: r.reply, repliedAt: r.repliedAt, createdAt: r.createdAt,
        }))}
      />
    </div>
  );
}
