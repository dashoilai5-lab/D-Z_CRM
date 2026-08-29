-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "servicePackageId" TEXT,
    "serviceAddons" JSONB,
    "date" DATETIME NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "type" TEXT NOT NULL DEFAULT 'SERVICE',
    "source" TEXT NOT NULL DEFAULT 'RIDER_APP',
    "campaignId" TEXT,
    "jobId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "ServicePackage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ServiceJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("branchId", "campaignId", "createdAt", "customerId", "date", "id", "jobId", "motorcycleId", "notes", "serviceAddons", "servicePackageId", "serviceType", "source", "status", "timeSlot", "updatedAt") SELECT "branchId", "campaignId", "createdAt", "customerId", "date", "id", "jobId", "motorcycleId", "notes", "serviceAddons", "servicePackageId", "serviceType", "source", "status", "timeSlot", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_jobId_key" ON "Booking"("jobId");
CREATE TABLE "new_ServiceJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobNumber" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "mechanicId" TEXT,
    "servicePackageId" TEXT,
    "packageName" TEXT,
    "mileage" INTEGER NOT NULL,
    "customerRequest" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "type" TEXT NOT NULL DEFAULT 'SERVICE',
    "estimatedCompletionAt" DATETIME,
    "startedAt" DATETIME,
    "readyAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceJob_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceJob_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceJob_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServiceJob_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "ServicePackage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ServiceJob" ("branchId", "completedAt", "createdAt", "customerId", "customerRequest", "estimatedCompletionAt", "id", "jobNumber", "mechanicId", "mileage", "motorcycleId", "packageName", "readyAt", "servicePackageId", "startedAt", "status", "updatedAt") SELECT "branchId", "completedAt", "createdAt", "customerId", "customerRequest", "estimatedCompletionAt", "id", "jobNumber", "mechanicId", "mileage", "motorcycleId", "packageName", "readyAt", "servicePackageId", "startedAt", "status", "updatedAt" FROM "ServiceJob";
DROP TABLE "ServiceJob";
ALTER TABLE "new_ServiceJob" RENAME TO "ServiceJob";
CREATE UNIQUE INDEX "ServiceJob_jobNumber_key" ON "ServiceJob"("jobNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
