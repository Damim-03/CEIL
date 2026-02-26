-- CreateTable
CREATE TABLE "CoursePricing" (
    "pricing_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "status_fr" VARCHAR(200) NOT NULL,
    "status_ar" VARCHAR(200),
    "status_en" VARCHAR(200),
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'DA',
    "discount" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePricing_pkey" PRIMARY KEY ("pricing_id")
);

-- AddForeignKey
ALTER TABLE "CoursePricing" ADD CONSTRAINT "CoursePricing_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "CourseProfile"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
