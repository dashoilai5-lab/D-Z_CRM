/**
 * 把 e2e.db 的 User/Customer 绑定到 Supabase auth 用户（email → authId）。
 * e2e 用真实 Supabase 登录（DEMO_ACCOUNTS），播种后必须回填 authId 才能
 * getSessionUser 命中业务记录。dev.db/PG 已绑定；e2e.db 每次播种后为空。
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const ACCOUNTS = [
  "daniel.tan@dz.my", "syafiq.bin.rahman@dz.my", "mei.ling.wong@dz.my",
  "aizat.bin.ismail@dz.my", "hafiz.bin.hassan@dz.my", "ravi.a.l.kumar@dz.my",
  "priya.a.p.lee@dz.my", "wei.kit.tan@dz.my", "ahmad.danial@dz.my", "muhammad.zain@dz.my",
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("[link-auth] missing Supabase env — skipping authId link");
    return;
  }
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const prisma = new PrismaClient();

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.log("[link-auth] listUsers error:", error.message);
    return;
  }
  console.log("[link-auth] supabase users:", data.users.length);
  const idByEmail = new Map<string, string>();
  for (const u of data.users) {
    if (u.email) idByEmail.set(u.email.toLowerCase(), u.id);
  }

  // 2. User 按 email 绑定
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  console.log("[link-auth] business users:", users.length);
  let linked = 0;
  for (const u of users) {
    const authId = u.email ? idByEmail.get(u.email.toLowerCase()) : undefined;
    if (authId) {
      await prisma.user.update({ where: { id: u.id }, data: { authId } });
      linked++;
    }
  }
  // 3. Customer 按 email 或 phone 绑定（Ahmad Danial: 012-345 6789）
  const phoneToEmail: Record<string, string> = {
    "012-345 6789": "ahmad.danial@dz.my",
  };
  const customers = await prisma.customer.findMany({ select: { id: true, email: true, phone: true } });
  for (const c of customers) {
    const byEmail = c.email ? idByEmail.get(c.email.toLowerCase()) : undefined;
    const byPhone = c.phone ? phoneToEmail[c.phone] : undefined;
    const authId = byEmail ?? (byPhone ? idByEmail.get(byPhone.toLowerCase()) : undefined);
    if (authId) {
      await prisma.customer.update({ where: { id: c.id }, data: { authId } });
      linked++;
    }
  }
  console.log("[link-auth] linked " + linked + " records");
  await prisma.$disconnect();
}

main().catch((e) => { console.error("[link-auth] error:", e.message); process.exit(1); });
