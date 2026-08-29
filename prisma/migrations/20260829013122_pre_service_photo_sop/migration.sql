-- CreateTable
CREATE TABLE "ServiceJobPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "capturedById" TEXT,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceJobPhoto_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ServiceJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceJobPhoto_jobId_angle_key" ON "ServiceJobPhoto"("jobId", "angle");
