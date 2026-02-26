-- AlterTable
ALTER TABLE "Fee" ADD COLUMN     "created_by" UUID,
ADD COLUMN     "processed_at" TIMESTAMP(3),
ADD COLUMN     "processed_by" UUID;
