-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_session_id_fkey";

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;
