-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN "enableMotorcycleQr" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organisation" ADD COLUMN "enableRiderProfileQr" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organisation" ADD COLUMN "enableWorkshopQr" BOOLEAN NOT NULL DEFAULT true;
