-- CreateTable
CREATE TABLE "pending_signups" (
    "pending_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ph_no" TEXT,
    "org_type" TEXT,
    "otp" TEXT NOT NULL,
    "otp_expiry" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_signups_pkey" PRIMARY KEY ("pending_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_signups_email_key" ON "pending_signups"("email");
