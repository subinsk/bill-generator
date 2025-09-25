-- CreateTable
CREATE TABLE "public"."bills" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bill_items" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "allows_decimal" BOOLEAN NOT NULL,

    CONSTRAINT "bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bill_distributions" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "bill_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gst_bills" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "bill_data" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "invoice_date" TEXT NOT NULL,
    "billed_to_name" TEXT NOT NULL,
    "grand_total" DOUBLE PRECISION NOT NULL,
    "final_amount" DOUBLE PRECISION NOT NULL,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gst_bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bills_uuid_key" ON "public"."bills"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "gst_bills_uuid_key" ON "public"."gst_bills"("uuid");

-- AddForeignKey
ALTER TABLE "public"."bill_items" ADD CONSTRAINT "bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bill_distributions" ADD CONSTRAINT "bill_distributions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
