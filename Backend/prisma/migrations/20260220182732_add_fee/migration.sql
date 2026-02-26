-- AlterTable
ALTER TABLE "Fee" ADD COLUMN     "confirmed_by" UUID;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
