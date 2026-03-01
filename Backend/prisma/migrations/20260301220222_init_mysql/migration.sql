-- CreateEnum
CREATE TYPE "NotificationTarget" AS ENUM ('ALL_STUDENTS', 'ALL_TEACHERS', 'SPECIFIC_STUDENTS', 'SPECIFIC_TEACHERS', 'GROUP', 'COURSE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('OPEN', 'FULL', 'FINISHED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STUDENT', 'TEACHER', 'OWNER');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED', 'PAID', 'FINISHED');

-- CreateEnum
CREATE TYPE "RegistrantCategory" AS ENUM ('STUDENT', 'EXTERNAL', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PHOTO', 'ID_CARD', 'STUDENT_CARD', 'SCHOOL_CERTIFICATE', 'REGISTRATION_CERTIFICATE', 'WORK_CERTIFICATE', 'ADMIN_CERTIFICATE', 'PAYMENT_RECEIPT');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BASICS', 'A1', 'A2', 'B1', 'B2', 'C1');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Student" (
    "student_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" "Gender",
    "user_id" UUID NOT NULL,
    "phone_number" VARCHAR(35),
    "email" VARCHAR(100),
    "secondary_email" VARCHAR(100),
    "address" TEXT,
    "nationality" VARCHAR(50),
    "language" TEXT,
    "avatar_url" TEXT,
    "education_level" VARCHAR(100),
    "study_location" VARCHAR(100),
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "registrant_category" "RegistrantCategory" NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "teacher_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "phone_number" VARCHAR(35),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "Course" (
    "course_id" UUID NOT NULL,
    "course_code" VARCHAR(20),
    "course_name" VARCHAR(100) NOT NULL,
    "credits" INTEGER,
    "fee_amount" DECIMAL(10,2) DEFAULT 1000,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "CourseProfile" (
    "profile_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "title_ar" VARCHAR(200),
    "description" TEXT,
    "description_ar" TEXT,
    "language" VARCHAR(50),
    "level" VARCHAR(20),
    "flag_emoji" VARCHAR(10),
    "price" DECIMAL(10,2) DEFAULT 0,
    "currency" VARCHAR(10) DEFAULT 'DZD',
    "session_name" VARCHAR(100),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "registration_open" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "image_public_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProfile_pkey" PRIMARY KEY ("profile_id")
);

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

-- CreateTable
CREATE TABLE "Department" (
    "department_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "Group" (
    "group_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "department_id" UUID,
    "course_id" UUID NOT NULL,
    "max_students" INTEGER NOT NULL DEFAULT 25,
    "status" "GroupStatus" NOT NULL DEFAULT 'OPEN',
    "teacher_id" UUID,
    "level" "Level" NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "enrollment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "group_id" UUID,
    "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "Level",
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "registration_status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "pricing_id" UUID,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "topic" TEXT,
    "room_id" UUID,
    "end_time" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Room" (
    "room_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendance_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "attended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "exam_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "exam_name" TEXT,
    "exam_date" TIMESTAMP(3) NOT NULL,
    "max_marks" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "Result" (
    "result_id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "marks_obtained" INTEGER NOT NULL,
    "grade" TEXT,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "Fee" (
    "fee_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "enrollment_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "FeeStatus" NOT NULL DEFAULT 'UNPAID',
    "payment_method" VARCHAR(30),
    "reference_code" VARCHAR(100),
    "paid_at" TIMESTAMP(3),
    "created_by" UUID,
    "processed_at" TIMESTAMP(3),
    "processed_by" UUID,
    "confirmed_by" UUID,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("fee_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "document_id" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "public_id" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "permission_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "StudentPermission" (
    "student_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "StudentPermission_pkey" PRIMARY KEY ("student_id","permission_id")
);

-- CreateTable
CREATE TABLE "RegistrationHistory" (
    "history_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "old_status" "RegistrationStatus" NOT NULL,
    "new_status" "RegistrationStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" UUID,

    CONSTRAINT "RegistrationHistory_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "google_id" TEXT,
    "google_email" TEXT,
    "google_avatar" TEXT,
    "student_id" UUID,
    "teacher_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "token_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "announcement_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "content" TEXT NOT NULL,
    "content_ar" TEXT,
    "excerpt" TEXT,
    "excerpt_ar" TEXT,
    "category" TEXT,
    "image_url" TEXT,
    "image_public_id" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "pinned_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("announcement_id")
);

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

-- CreateTable
CREATE TABLE "AuditLog" (
    "log_id" UUID NOT NULL,
    "user_id" UUID,
    "user_email" VARCHAR(100),
    "user_role" VARCHAR(20),
    "action" VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(100),
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "setting_id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_user_id_key" ON "Student"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_code_key" ON "Course"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProfile_course_id_key" ON "CourseProfile"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_student_id_course_id_key" ON "Enrollment"("student_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_session_id_student_id_key" ON "Attendance"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Result_exam_id_student_id_key" ON "Result"("exam_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_student_id_key" ON "User"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_teacher_id_key" ON "User"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "RefreshToken"("user_id");

-- CreateIndex
CREATE INDEX "NotificationRecipient_user_id_is_read_idx" ON "NotificationRecipient"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notification_id_user_id_key" ON "NotificationRecipient"("notification_id", "user_id");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_type_idx" ON "AuditLog"("entity_type");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- AddForeignKey
ALTER TABLE "CourseProfile" ADD CONSTRAINT "CourseProfile_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePricing" ADD CONSTRAINT "CoursePricing_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "CourseProfile"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_pricing_id_fkey" FOREIGN KEY ("pricing_id") REFERENCES "CoursePricing"("pricing_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("enrollment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPermission" ADD CONSTRAINT "StudentPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPermission" ADD CONSTRAINT "StudentPermission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationHistory" ADD CONSTRAINT "RegistrationHistory_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("enrollment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
