-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('NORMAL', 'INTENSIVE');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "course_type" "CourseType" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Course" ADD COLUMN "session_duration" INTEGER;