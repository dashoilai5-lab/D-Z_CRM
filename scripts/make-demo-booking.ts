import { bookingService } from "../src/modules/bookings/service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.organisation.findFirst();
  const branch = await prisma.branch.findFirst({ where: { organisationId: org!.id, isMain: true } });
  const cust = await prisma.customer.findFirst({ where: { phone: "012-345 6789" } });
  const bike = await prisma.motorcycle.findFirst({ where: { customerId: cust!.id } });
  if (!bike) return;
  const date = new Date(Date.now() + 2 * 86400000); date.setHours(9, 0, 0, 0);
  const existing = await prisma.booking.findFirst({ where: { motorcycleId: bike.id, status: { in: ["REQUESTED", "CONFIRMED", "CHECKED_IN"] } } });
  if (existing) { console.log("already active:", existing.id); return; }
  const bk = await bookingService.create({
    branchId: branch!.id, customerId: cust!.id, motorcycleId: bike.id,
    serviceType: "Standard Service", date, timeSlot: "10:00", source: "RIDER_APP",
  });
  console.log("created booking:", (bk as { id: string }).id);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(String(e)); process.exit(1); });
