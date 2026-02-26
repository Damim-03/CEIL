-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinned_at" TIMESTAMP(3);
