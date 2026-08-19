import { PrismaClient } from "@prisma/client";
import path from "node:path";
(async () => {
  const p = new PrismaClient({ datasources: { db: { url: "file:" + path.resolve("prisma/dev.db") } } });
  const campaigns = await p.campaign.count();
  const assets = await p.marketingAsset.count();
  const scripts = await p.contentScript.count();
  const reviews = await p.review.count();
  const messages = await p.message.count({ where: { channel: "WHATSAPP" } });
  const activePromos = await p.campaign.count({ where: { type: "PROMO", status: "ACTIVE" } });
  const reminders = await p.serviceReminder.count({ where: { status: "UPCOMING" } });
  const customers = await p.customer.count();
  console.log(JSON.stringify({ campaigns, assets, scripts, reviews, messages, activePromos, reminders, customers }, null, 1));
  await p.$disconnect();
})();
