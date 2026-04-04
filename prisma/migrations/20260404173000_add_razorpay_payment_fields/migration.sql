ALTER TABLE "Payment"
ADD COLUMN "gatewayOrderId" TEXT,
ADD COLUMN "gatewayPaymentId" TEXT,
ADD COLUMN "gatewaySignature" TEXT;

CREATE UNIQUE INDEX "Payment_gatewayPaymentId_key" ON "Payment"("gatewayPaymentId");
