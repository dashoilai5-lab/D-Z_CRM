import { getRiderCustomer } from "@/lib/rider-customer";
import { db } from "@/lib/db";
import { NotificationsList } from "@/components/rider/notifications-list";

export const dynamic = "force-dynamic";

export default async function RiderNotificationsPage() {
  const customer = await getRiderCustomer();
  if (!customer) return null;
  const notifications = await db.notification.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="space-y-4">
      <NotificationsList
        customerId={customer.id}
        notifications={notifications.map((n) => ({ id: n.id, title: n.title, body: n.body, type: n.type, readAt: n.readAt, createdAt: n.createdAt }))}
      />
    </div>
  );
}