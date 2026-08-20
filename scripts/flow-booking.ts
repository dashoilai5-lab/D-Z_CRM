import { bookingService } from "../src/modules/bookings/service";
import { jobService } from "../src/modules/service-jobs/service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const cust = await prisma.customer.findFirst({ where: { phone: "012-345 6789" } });
  const bike = await prisma.motorcycle.findFirst({ where: { customerId: cust!.id } });
  const bk = await prisma.booking.findFirst({ where: { motorcycleId: bike!.id, status: { in: ["REQUESTED", "CONFIRMED", "CHECKED_IN"] } } });
  if (!bk) { console.log("no booking"); return; }
  const stage = process.argv[2] ?? "confirmed";
  if (stage === "confirmed" && bk.status === "REQUESTED") {
    await bookingService.transition(bk.id, "CONFIRMED");
    console.log("-> CONFIRMED");
  }
  if (stage === "checkin") {
    const result = await bookingService.checkIn(bk.id, { mileage: 31500, branchId: bk.branchId });
    console.log("-> CHECKED_IN job:", result?.jobNumber);
  }
  if (stage === "inprogress") {
    const job = await prisma.serviceJob.findFirst({ where: { booking: { id: bk.id } } });
    if (job && job.status === "WAITING") { await jobService.transition(job.id, "IN_PROGRESS"); console.log("-> IN_PROGRESS"); }
    else console.log("job status:", job?.status);
  }
  if (stage === "qc") {
    const job = await prisma.serviceJob.findFirst({ where: { booking: { id: bk.id } } });
    if (job) { await jobService.transition(job.id, "QC_CHECK"); console.log("-> QC_CHECK"); }
  }
  if (stage === "ready") {
    const job = await prisma.serviceJob.findFirst({ where: { booking: { id: bk.id } } });
    if (job) { await jobService.transition(job.id, "READY"); console.log("-> READY"); }
  }
  await prisma.$disconnect();
}
main().catch((e) => { console.error(String(e)); process.exit(1); });
