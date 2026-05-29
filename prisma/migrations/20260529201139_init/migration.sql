-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "cookieColor" TEXT NOT NULL,
    "cookieName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deadline" DATETIME NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "shippingAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "readyDate" DATETIME,
    "notes" TEXT
);
