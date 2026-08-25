-- AlterTable: QR scan tokens (unguessable, per-entity)
ALTER TABLE "Customer" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "Motorcycle" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "qrToken" TEXT;

-- Backfill existing rows with a random 16-char token
UPDATE "Customer" SET "qrToken" = substr(lower(hex(randomblob(12))), 1, 16) WHERE "qrToken" IS NULL;
UPDATE "Motorcycle" SET "qrToken" = substr(lower(hex(randomblob(12))), 1, 16) WHERE "qrToken" IS NULL;
UPDATE "Organisation" SET "qrToken" = substr(lower(hex(randomblob(12))), 1, 16) WHERE "qrToken" IS NULL;

-- Unique indexes (SQLite syntax)
CREATE UNIQUE INDEX "Customer_qrToken_key" ON "Customer"("qrToken");
CREATE UNIQUE INDEX "Motorcycle_qrToken_key" ON "Motorcycle"("qrToken");
CREATE UNIQUE INDEX "Organisation_qrToken_key" ON "Organisation"("qrToken");
