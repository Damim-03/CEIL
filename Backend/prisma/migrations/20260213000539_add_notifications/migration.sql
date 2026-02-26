-- CreateEnum
CREATE TYPE "NotificationTarget" AS ENUM ('ALL_STUDENTS', 'ALL_TEACHERS', 'SPECIFIC_STUDENTS', 'SPECIFIC_TEACHERS', 'GROUP', 'COURSE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "title_ar" VARCHAR(200),
    "message" TEXT NOT NULL,
    "message_ar" TEXT,
    "target_type" "NotificationTarget" NOT NULL,
    "course_id" UUID,
    "group_id" UUID,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "recipient_id" UUID NOT NULL,
    "notification_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("recipient_id")
);

-- CreateIndex
CREATE INDEX "NotificationRecipient_user_id_is_read_idx" ON "NotificationRecipient"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notification_id_user_id_key" ON "NotificationRecipient"("notification_id", "user_id");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
