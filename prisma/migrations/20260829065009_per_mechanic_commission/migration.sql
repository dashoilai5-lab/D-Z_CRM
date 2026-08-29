-- AlterTable
ALTER TABLE "ServiceJob" ADD COLUMN "commissionSen" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "commissionRules" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StaffPayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "baseSen" INTEGER NOT NULL DEFAULT 0,
    "commissionSen" INTEGER NOT NULL DEFAULT 0,
    "addonBonusSen" INTEGER NOT NULL DEFAULT 0,
    "bonusSen" INTEGER NOT NULL DEFAULT 0,
    "totalSen" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StaffPayout" ("addonBonusSen", "baseSen", "commissionSen", "createdAt", "id", "paidAt", "period", "periodStart", "status", "totalSen", "userId") SELECT "addonBonusSen", "baseSen", "commissionSen", "createdAt", "id", "paidAt", "period", "periodStart", "status", "totalSen", "userId" FROM "StaffPayout";
DROP TABLE "StaffPayout";
ALTER TABLE "new_StaffPayout" RENAME TO "StaffPayout";
CREATE UNIQUE INDEX "StaffPayout_userId_period_periodStart_key" ON "StaffPayout"("userId", "period", "periodStart");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
