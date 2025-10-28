-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('PENDING', 'ANSWERED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "CarMaintenanceTask" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "intervalKm" INTEGER,
    "intervalMonths" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "recommendedProductSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarMaintenanceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductQuestion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" "QuestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "ProductQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarQuestion" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" "QuestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "CarQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementEvent" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarMaintenanceTask_carId_idx" ON "CarMaintenanceTask"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "CarMaintenanceTask_carId_title_key" ON "CarMaintenanceTask"("carId", "title");

-- CreateIndex
CREATE INDEX "ProductQuestion_productId_status_idx" ON "ProductQuestion"("productId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductQuestion_productId_question_key" ON "ProductQuestion"("productId", "question");

-- CreateIndex
CREATE INDEX "CarQuestion_carId_status_idx" ON "CarQuestion"("carId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CarQuestion_carId_question_key" ON "CarQuestion"("carId", "question");

-- CreateIndex
CREATE INDEX "EngagementEvent_entityType_entityId_eventType_createdAt_idx" ON "EngagementEvent"("entityType", "entityId", "eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "CarMaintenanceTask" ADD CONSTRAINT "CarMaintenanceTask_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestion" ADD CONSTRAINT "ProductQuestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarQuestion" ADD CONSTRAINT "CarQuestion_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
