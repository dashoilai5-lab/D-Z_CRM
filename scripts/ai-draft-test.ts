import { generateDraft } from "../src/modules/ai/draft";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const cust = await prisma.customer.findFirst({ where: { phone: "012-345 6789" } });
  if (!cust) { console.log("no customer"); return; }
  const d = await generateDraft({ customerId: cust.id, kind: "service_due", tone: "friendly" });
  console.log("=== DRAFT ===");
  console.log(d.body);
  console.log("=== FACTS ===");
  console.log(JSON.stringify(d.facts));
  await prisma.$disconnect();
}
main().catch((e) => { console.error(String(e)); process.exit(1); });
