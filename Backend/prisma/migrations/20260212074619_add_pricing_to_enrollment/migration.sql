-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "pricing_id" UUID;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_pricing_id_fkey" FOREIGN KEY ("pricing_id") REFERENCES "CoursePricing"("pricing_id") ON DELETE SET NULL ON UPDATE CASCADE;
