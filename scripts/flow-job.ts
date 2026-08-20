import { jobService } from "../src/modules/service-jobs/service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const cust = await prisma.customer.findFirst({ where: { phone: "012-345 6789" } });
  const bike = await prisma.motorcycle.findFirst({ where: { customerId: cust!.id } });
  const job = await prisma.serviceJob.findFirst({ where: { motorcycleId: bike!.id, status: { not: "COMPLETED" } }, orderBy: { createdAt: "desc" } });
  if (!job) { console.log("no job"); return; }
  const to = process.argv[2] ?? "READY";
  try { await jobService.transition(job.id, to as never); console.log("job", job.jobNumber, "->", to); }
  catch (e) { console.log("transition failed:", String((e as Error).message).slice(0, 60)); }
  await prisma.$disconnect();
}
main().catch((e) => { console.error(String(e)); process.exit(1); });
