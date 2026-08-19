import { PrismaClient } from "@prisma/client";
import path from "node:path";
(async () => {
  const p = new PrismaClient({ datasources: { db: { url: "file:" + path.resolve("prisma/dev.db") } } });
  // 客户总数 + 有提醒的 + 新客户(joinedAt 30天内) + 有电话的
  const total = await p.customer.count();
  const withPhone = await p.customer.count({ where: { phone: { not: null } } });
  const overdue = await p.serviceReminder.count({ where: { status: { in: ["DUE", "OVERDUE"] } } });
  const dueSoon = await p.serviceReminder.count({ where: { status: { in: ["UPCOMING", "DUE_SOON", "DUE", "OVERDUE"] } } });
  const recent30 = await p.customer.count({ where: { joinedAt: { gte: new Date(Date.now() - 30*86400000) } } });
  console.log(JSON.stringify({ total, withPhone, overdue, dueSoon, recent30 }));
  await p.$disconnect();
})();
