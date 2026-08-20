// Customer timeline — single chronological feed of every applicable event.
import { db } from "@/lib/db";

export interface TimelineEvent {
  time: Date;
  type: string;      // TIME-001..023 event kind
  title: string;
  detail?: string | null;
  ref?: { href?: string; label?: string } | null;
}

export async function customerTimeline(customerId: string): Promise<TimelineEvent[]> {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      leadsConverted: { include: { activities: true } },
      bookings: true,
      jobs: { include: { statusHistory: true, motorcycle: true, invoice: { select: { totalSen: true } } } },
      messages: true,
      reminders: true,
      reviews: true,
      loyaltyAccount: { include: { transactions: true, tier: true } },
      referralsMade: true,
      referralsReceived: { include: { referringCustomer: { select: { name: true } } } },
      motorcycles: true,
    },
  });
  if (!customer) return [];

  const events: TimelineEvent[] = [];

  // customer creation
  events.push({ time: customer.createdAt, type: "CUSTOMER_CREATED", title: "Customer record created", detail: customer.name });

  // motorcycles registered
  for (const m of customer.motorcycles) {
    events.push({ time: m.createdAt, type: "VEHICLE_REGISTERED", title: "Motorcycle registered", detail: m.brand + " " + m.model + " (" + m.plate + ")" });
  }

  // leads + activities
  for (const lead of customer.leadsConverted) {
    events.push({ time: lead.createdAt, type: "LEAD_CREATED", title: "Lead created", detail: lead.leadNumber });
    for (const a of lead.activities) {
      events.push({ time: a.createdAt, type: "LEAD_" + a.type, title: "Lead: " + a.type.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()), detail: a.note, ref: { href: "/workshop/leads/" + lead.id, label: lead.leadNumber } });
    }
  }

  // bookings
  for (const b of customer.bookings) {
    events.push({ time: b.createdAt, type: "BOOKING_CREATED", title: "Service booking created", detail: b.serviceType + " · " + b.date.toISOString().slice(0, 10) + " " + b.timeSlot + " · " + b.status, ref: { href: "/workshop/bookings", label: "Booking" } });
  }

  // jobs + status history
  for (const j of customer.jobs) {
    events.push({ time: j.createdAt, type: "VEHICLE_CHECKED_IN", title: "Job created", detail: j.jobNumber + " · " + j.motorcycle.brand + " " + j.motorcycle.model, ref: { href: "/workshop/jobs/" + j.id, label: j.jobNumber } });
    for (const sh of j.statusHistory) {
      events.push({ time: sh.changedAt, type: "JOB_STATUS", title: "Job status → " + sh.toStatus.replace(/_/g, " "), detail: j.jobNumber + (sh.note ? " · " + sh.note : "") });
    }
    if (j.startedAt) events.push({ time: j.startedAt, type: "SERVICE_STARTED", title: "Service started", detail: j.jobNumber });
    if (j.readyAt) events.push({ time: j.readyAt, type: "SERVICE_READY", title: "Service ready", detail: j.jobNumber });
    if (j.completedAt) events.push({ time: j.completedAt, type: "SERVICE_COMPLETED", title: "Service completed", detail: j.jobNumber + (j.invoice ? " · RM" + (j.invoice.totalSen / 100).toFixed(2) : "") });
  }

  // messages
  for (const m of customer.messages) {
    events.push({ time: m.createdAt, type: "MESSAGE_SENT", title: (m.direction === "OUT" ? "Message sent" : "Message received") + " · " + m.channel, detail: m.body.slice(0, 120) });
  }

  // reminders
  for (const r of customer.reminders) {
    events.push({ time: r.createdAt, type: "REMINDER_SCHEDULED", title: "Service reminder scheduled", detail: "next " + r.nextServiceMileage + " km" + (r.estimatedDate ? " · est " + r.estimatedDate.toISOString().slice(0, 10) : "") });
  }

  // reviews
  for (const r of customer.reviews) {
    events.push({ time: r.createdAt, type: "REVIEW", title: "Review" + (r.rating ? " " + r.rating + "★" : ""), detail: r.comment ?? null });
  }

  // loyalty
  if (customer.loyaltyAccount) {
    for (const t of customer.loyaltyAccount.transactions) {
      events.push({ time: t.createdAt, type: "LOYALTY_" + t.type, title: "Loyalty " + t.type.toLowerCase() + " " + (t.points > 0 ? "+" : "") + t.points + " pts", detail: t.reason, ref: { href: "/workshop/customers/" + customer.id, label: "Balance " + t.balanceAfter } });
    }
  }

  // referrals
  for (const r of customer.referralsMade) {
    events.push({ time: r.createdAt, type: "REFERRAL", title: "Referral made", detail: "code " + r.code + " · " + r.status, ref: { href: "/workshop/customers/" + customer.id, label: "Referral" } });
  }
  for (const r of customer.referralsReceived) {
    events.push({ time: r.createdAt, type: "REFERRAL", title: "Referred by " + r.referringCustomer.name, detail: r.code });
  }

  // tasks linked to this customer
  const tasks = await db.task.findMany({ where: { relatedType: "CUSTOMER", relatedId: customerId } });
  for (const t of tasks) {
    events.push({ time: t.createdAt, type: "FOLLOW_UP_CREATED", title: "Follow-up task created", detail: t.title + (t.completedAt ? " · completed " + t.completedAt.toISOString().slice(0, 10) : "") });
  }

  return events.sort((a, b) => a.time.getTime() - b.time.getTime());
}
