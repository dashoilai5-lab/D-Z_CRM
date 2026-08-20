// AI message drafts — rule-based in the prototype (OpenAI later).
// AI-018/019: drafts reference only structured CRM data; never invented facts.
import { db } from "@/lib/db";

export type DraftKind = "follow_up" | "booking_reminder" | "invoice" | "promo" | "service_due";

const TONE_OPENERS: Record<string, string> = {
  friendly: "Hi {name},",
  professional: "Dear {name},",
  casual: "Hai {name}!",
};

export async function generateDraft(input: { customerId: string; kind: DraftKind; tone?: string }): Promise<{ body: string; facts: Record<string, string> }> {
  const customer = await db.customer.findUnique({
    where: { id: input.customerId },
    include: { motorcycles: true, bookings: { orderBy: { date: "desc" }, take: 1 }, jobs: { orderBy: { createdAt: "desc" }, take: 1, include: { invoice: true } }, reminders: { orderBy: { nextServiceMileage: "asc" }, take: 1 } },
  });
  if (!customer) throw new Error("Customer not found");
  const bike = customer.motorcycles[0];
  const booking = customer.bookings[0];
  const job = customer.jobs[0];
  const reminder = customer.reminders[0];
  const tone = input.tone ?? "friendly";
  const opener = (TONE_OPENERS[tone] ?? TONE_OPENERS.friendly).replace("{name}", customer.name.split(" ")[0]);

  const facts: Record<string, string> = {
    name: customer.name, phone: customer.phone ?? "", email: customer.email ?? "",
    bike: bike ? bike.brand + " " + bike.model + " (" + bike.plate + ")" : "",
    lastService: job ? job.createdAt.toISOString().slice(0, 10) : "",
    nextService: reminder ? reminder.nextServiceMileage.toLocaleString() + " km" : "",
    bookingDate: booking ? booking.date.toISOString().slice(0, 10) + " " + booking.timeSlot : "",
    invoiceTotal: job?.invoice ? "RM" + (job.invoice.totalSen / 100).toFixed(2) : "",
  };

  let body = "";
  switch (input.kind) {
    case "follow_up":
      body = opener + "\n\nThanks for visiting us" + (facts.lastService ? " on " + facts.lastService : "") + "! Just checking in to see how your " + (facts.bike || "motorcycle") + " is running. Anything we can help with? Reply here anytime.";
      break;
    case "booking_reminder":
      body = opener + "\n\nThis is a reminder for your service appointment" + (facts.bookingDate ? " on " + facts.bookingDate : "") + (facts.bike ? " for " + facts.bike : "") + ". See you then — D&Z Smart Workshop.";
      break;
    case "invoice":
      body = opener + "\n\nYour invoice is ready" + (facts.invoiceTotal ? " — total " + facts.invoiceTotal : "") + (facts.bike ? " for " + facts.bike : "") + ". You can settle it at the counter or online. Thank you!";
      break;
    case "promo":
      body = opener + "\n\nWe have a special promotion this month on servicing! Book your " + (facts.bike || "motorcycle") + " and enjoy the discount. Tap the booking link to reserve your slot.";
      break;
    case "service_due":
      body = opener + "\n\nYour " + (facts.bike || "motorcycle") + " is due for service" + (facts.nextService ? " at " + facts.nextService : "") + ". Book your slot now and keep it running smooth.";
      break;
  }
  return { body, facts };
}
