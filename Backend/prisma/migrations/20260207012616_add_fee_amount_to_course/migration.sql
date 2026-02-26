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

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("announcement_id")
);
