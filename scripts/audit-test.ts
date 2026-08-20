import { loyaltyModule } from "../src/modules/loyalty/service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.organisation.findFirst();
  const cust = await prisma.customer.findFirst({ where: { phone: "012-345 6789" } });
  if (!cust) return;
  await loyaltyModule.adjustPoints({ organisationId: org!.id, customerId: cust.id, delta: -10, reason: "Audit test" });
  const log = await prisma.auditLog.findFirst({ where: { action: "LOYALTY_ADJUST" }, orderBy: { createdAt: "desc" } });
  console.log("audit written:", log ? log.action + " " + log.after : "NONE");
  await prisma.$disconnect();
}
main().catch((e) => { console.error(String(e)); process.exit(1); });
