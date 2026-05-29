-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "cookieColor" TEXT NOT NULL,
    "cookieName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "shippingAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "readyDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
