-- CreateTable
CREATE TABLE "StaffPayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "baseSen" INTEGER NOT NULL DEFAULT 0,
    "commissionSen" INTEGER NOT NULL DEFAULT 0,
    "addonBonusSen" INTEGER NOT NULL DEFAULT 0,
    "totalSen" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffPayoutPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payoutId" TEXT NOT NULL,
    "amountSen" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'CASH',
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffPayoutPayment_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "StaffPayout" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPayout_userId_period_periodStart_key" ON "StaffPayout"("userId", "period", "periodStart");
