-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Motorcycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT NOT NULL,
    "vin" TEXT,
    "color" TEXT,
    "type" TEXT NOT NULL DEFAULT 'UNDERBONE',
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "lastServiceDate" DATETIME,
    "lastServiceMileage" INTEGER,
    "lastOilChangeMileage" INTEGER,
    "lastOilFilterMileage" INTEGER,
    "nextServiceMileage" INTEGER,
    "nextServiceEstDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Motorcycle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Motorcycle" ("brand", "color", "createdAt", "currentMileage", "customerId", "id", "lastOilChangeMileage", "lastOilFilterMileage", "lastServiceDate", "lastServiceMileage", "model", "nextServiceEstDate", "nextServiceMileage", "plate", "vin", "year") SELECT "brand", "color", "createdAt", "currentMileage", "customerId", "id", "lastOilChangeMileage", "lastOilFilterMileage", "lastServiceDate", "lastServiceMileage", "model", "nextServiceEstDate", "nextServiceMileage", "plate", "vin", "year" FROM "Motorcycle";
DROP TABLE "Motorcycle";
ALTER TABLE "new_Motorcycle" RENAME TO "Motorcycle";
CREATE UNIQUE INDEX "Motorcycle_plate_key" ON "Motorcycle"("plate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
