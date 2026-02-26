/*
  Warnings:

  - You are about to drop the column `group_id` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_group_id_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "group_id";
