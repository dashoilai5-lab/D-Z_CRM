import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session-user";
import { MechanicNotificationsList } from "@/components/mechanic/notifications-list";

export const dynamic = "force-dynamic";

/** Mechanic App alerts: userId-scoped notification feed. */
export default async function MechanicNotificationsPage() {
  const session = await getSessionUser();
  if (session.kind !== "staff" || !session.user) redirect("/workshop/dashboard");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <MechanicNotificationsList
        userId={session.user.id}
        notifications={notifications.map((n) => ({ id: n.id, title: n.title, body: n.body, type: n.type, readAt: n.readAt, createdAt: n.createdAt }))}
      />
    </div>
  );
}
