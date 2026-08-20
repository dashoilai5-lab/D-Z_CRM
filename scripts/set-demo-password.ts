import { hashPassword } from "../src/lib/auth/password";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findFirst({ where: { email: "daniel.tan@dz.my" } });
  if (!u) {
    const any = await prisma.user.findFirst({ where: { role: "OWNER" } });
    console.log("owner email not found; using", any?.email, any?.id);
    await prisma.user.update({ where: { id: any!.id }, data: { passwordHash: hashPassword("demo1234"), emailVerified: true, failedLoginCount: 0, lockedUntil: null } });
    console.log("set password on", any?.email);
  } else {
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: hashPassword("demo1234"), emailVerified: true, failedLoginCount: 0, lockedUntil: null } });
    console.log("set password on", u.email);
  }
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
