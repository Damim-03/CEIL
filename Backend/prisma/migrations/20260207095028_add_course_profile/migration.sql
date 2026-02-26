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

-- CreateIndex
CREATE UNIQUE INDEX "CourseProfile_course_id_key" ON "CourseProfile"("course_id");

-- AddForeignKey
ALTER TABLE "CourseProfile" ADD CONSTRAINT "CourseProfile_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;
