-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "tags" TEXT;

-- AlterTable
ALTER TABLE "Motorcycle" ADD COLUMN "notes" TEXT;
ALTER TABLE "Motorcycle" ADD COLUMN "purchaseDate" DATETIME;
ALTER TABLE "Motorcycle" ADD COLUMN "warrantyExpiry" DATETIME;
ALTER TABLE "Motorcycle" ADD COLUMN "warrantyKm" INTEGER;
