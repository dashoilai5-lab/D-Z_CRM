-- AlterTable
ALTER TABLE "User" ADD COLUMN "authId" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "authId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_authId_key" ON "Customer"("authId");
