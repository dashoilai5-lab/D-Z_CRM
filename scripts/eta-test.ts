import { jobService } from "../src/modules/service-jobs/service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const job = await prisma.serviceJob.findFirst({ where: { status: "WAITING" }, orderBy: { createdAt: "desc" } });
  if (!job) { console.log("no waiting job"); return; }
  await jobService.transition(job.id, "IN_PROGRESS");
  const after = await prisma.serviceJob.findUnique({ where: { id: job.id } });
  console.log("job", after?.jobNumber, "-> IN_PROGRESS, ETA:", after?.estimatedCompletionAt?.toISOString() ?? "NOT SET");
  await prisma.$disconnect();
}
main().catch((e) => { console.error(String(e)); process.exit(1); });
