import { loyaltyModule } from "../src/modules/loyalty/service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.organisation.findFirst();
  const cust = await prisma.customer.findFirst({ where: { phone: "012-345 6789" } });
  if (!cust) { console.log("no demo customer"); return; }
  const r = await loyaltyModule.earnPoints({ organisationId: org!.id, customerId: cust.id, points: 320, reason: "Demo bonus" });
  console.log("awarded:", cust.name, r?.balance);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(String(e)); process.exit(1); });
