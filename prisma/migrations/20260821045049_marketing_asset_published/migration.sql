-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MarketingAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'POSTER',
    "month" TEXT,
    "description" TEXT,
    "url" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketingAsset_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MarketingAsset" ("branchId", "createdAt", "description", "id", "month", "title", "type", "url") SELECT "branchId", "createdAt", "description", "id", "month", "title", "type", "url" FROM "MarketingAsset";
DROP TABLE "MarketingAsset";
ALTER TABLE "new_MarketingAsset" RENAME TO "MarketingAsset";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
