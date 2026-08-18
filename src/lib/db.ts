import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    transactionOptions: { maxWait: 10000, timeout: 60000 },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
