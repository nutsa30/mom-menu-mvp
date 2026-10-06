BEGIN;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'ka',
ADD COLUMN     "market" TEXT NOT NULL DEFAULT 'GE',
ADD COLUMN     "subscriptionAmount" DOUBLE PRECISION,
ADD COLUMN     "subscriptionCurrency" TEXT NOT NULL DEFAULT 'GEL',
ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'Asia/Tbilisi',
ADD COLUMN     "units" TEXT NOT NULL DEFAULT 'metric';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GEL';

-- AlterTable
ALTER TABLE "CreditLedgerEntry" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GEL';

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "contentEn" TEXT;

-- AlterTable
ALTER TABLE "PendingRegistration" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'ka',
ADD COLUMN     "market" TEXT NOT NULL DEFAULT 'GE',
ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'Asia/Tbilisi';

-- AlterTable
ALTER TABLE "EmailCampaign" ADD COLUMN     "htmlContentEn" TEXT,
ADD COLUMN     "subjectEn" TEXT;

-- AlterTable
ALTER TABLE "PushTemplate" ADD COLUMN     "bodyEn" TEXT,
ADD COLUMN     "titleEn" TEXT;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GEL';

-- CreateTable
CREATE TABLE "CheckoutOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "interval" INTEGER NOT NULL,
    "trial" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationDelivery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutOrder_userId_idx" ON "CheckoutOrder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationDelivery_userId_kind_localDate_key" ON "CommunicationDelivery"("userId", "kind", "localDate");

COMMIT;
