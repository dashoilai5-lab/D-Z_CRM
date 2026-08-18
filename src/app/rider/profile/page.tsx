import { getDemoCustomer } from "@/lib/demo-customer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RiderProfilePage() {
  const customer = await getDemoCustomer();
  if (!customer) return null;
  const [visits, reviews, notifications] = await Promise.all([
    db.serviceJob.count({ where: { customerId: customer.id, status: "COMPLETED" } }),
    db.review.count({ where: { customerId: customer.id } }),
    db.notification.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return (
    <div className="space-y-5">
      <div className="text-center">
        <Avatar className="h-20 w-20 mx-auto text-xl"><AvatarFallback className="bg-primary/10 text-primary">{initials(customer.name)}</AvatarFallback></Avatar>
        <h1 className="mt-3 text-xl font-bold">{customer.name}</h1>
        <p className="text-sm text-muted-foreground">{customer.phone}{customer.email ? " · " + customer.email : ""}</p>
        <p className="text-xs text-muted-foreground mt-1">Member since {customer.joinedAt.getFullYear()}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">{visits}</div>
          <div className="text-xs text-muted-foreground">Services</div>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">{reviews}</div>
          <div className="text-xs text-muted-foreground">Reviews</div>
        </div>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Notifications</h2>
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-xl border bg-card p-3 text-sm">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.body}</div>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
        </div>
      </div>
      <p className="text-center text-[11px] text-muted-foreground pt-2">D&Z Rider · demo persona: Customer (Ahmad Danial)</p>
    </div>
  );
}
