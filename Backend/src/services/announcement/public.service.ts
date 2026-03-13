// ================================================================
// 📦 src/services/public.service.ts
// ✅ Public-facing read-only data — Home, Announcements, Courses
// ✅ 📌 Pinned announcements appear first
// ✅ 📎 Attachment fields included
// ================================================================

import { prisma } from "../../prisma/client";

// ══════════════════════════════════════════════
// HOME STATS
// ══════════════════════════════════════════════

export async function getHomeStats() {
  const [studentsCount, publishedProfiles] = await Promise.all([
    prisma.student.count(),
    prisma.courseProfile.findMany({
      where: { is_published: true },
      select: { language: true },
    }),
  ]);

  const uniqueLanguages = new Set(
    publishedProfiles
      .map((p: { language: string | null }) => p.language)
      .filter(Boolean),
  );

  return {
    languages_count: uniqueLanguages.size,
    students_count: studentsCount,
    courses_count: publishedProfiles.length,
  };
}

// ══════════════════════════════════════════════
// PUBLIC ANNOUNCEMENTS (published only)
// ✅ Pinned first, then by published_at
// ✅ 📎 Attachment fields included
// ══════════════════════════════════════════════

export async function listPublicAnnouncements(params: {
  page?: number;
  limit?: number;
  category?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = { is_published: true };
  if (params.category) {
    where.category = params.category.toUpperCase();
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      select: {
        announcement_id: true,
        title: true,
        title_ar: true,
        excerpt: true,
        excerpt_ar: true,
        category: true,
        image_url: true,
        is_pinned: true,
        published_at: true,
        created_at: true,
        // ✅ Attachment fields
        attachment_url: true,
        attachment_name: true,
        attachment_type: true,
      },
      orderBy: [
        { is_pinned: "desc" },
        { pinned_at: "desc" },
        { published_at: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    data: announcements.map((a) => ({
      id: a.announcement_id,
      title: a.title,
      title_ar: a.title_ar,
      excerpt: a.excerpt,
      excerpt_ar: a.excerpt_ar,
      category: a.category,
      image_url: a.image_url,
      is_pinned: a.is_pinned,
      date: a.published_at || a.created_at,
      // ✅ Attachment
      attachment_url: a.attachment_url,
      attachment_name: a.attachment_name,
      attachment_type: a.attachment_type,
    })),
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

export async function getPublicAnnouncementById(announcementId: string) {
  const announcement = await prisma.announcement.findFirst({
    where: {
      announcement_id: announcementId,
      is_published: true,
    },
  });

  if (!announcement) return null;

  return {
    id: announcement.announcement_id,
    title: announcement.title,
    title_ar: announcement.title_ar,
    content: announcement.content,
    content_ar: announcement.content_ar,
    excerpt: announcement.excerpt,
    excerpt_ar: announcement.excerpt_ar,
    category: announcement.category,
    image_url: announcement.image_url,
    is_pinned: announcement.is_pinned,
    date: announcement.published_at || announcement.created_at,
    // ✅ Attachment
    attachment_url: announcement.attachment_url,
    attachment_name: announcement.attachment_name,
    attachment_type: announcement.attachment_type,
  };
}

// ══════════════════════════════════════════════
// PUBLIC COURSES (published only)
// ══════════════════════════════════════════════

export async function listPublicCourses(params: {
  page?: number;
  limit?: number;
  language?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 12;
  const skip = (page - 1) * limit;

  const profileWhere: any = { is_published: true };
  if (params.language) {
    // Case-insensitive — normalize to lowercase for consistent grouping
    profileWhere.language = {
      equals: params.language,
      mode: "insensitive",
    };
  }

  const [profiles, total] = await Promise.all([
    prisma.courseProfile.findMany({
      where: profileWhere,
      include: {
        course: {
          select: {
            course_id: true,
            course_name: true,
            course_code: true,
            fee_amount: true,
            course_type: true,
            session_duration: true,
            groups: {
              select: {
                max_students: true,
                _count: {
                  select: {
                    enrollments: {
                      where: {
                        registration_status: {
                          in: ["VALIDATED", "PAID", "FINISHED"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.courseProfile.count({ where: profileWhere }),
  ]);

  const data = profiles.map((p) => {
    const totalEnrolled = p.course.groups.reduce(
      (sum: number, g) => sum + g._count.enrollments,
      0,
    );
    const totalCapacity = p.course.groups.reduce(
      (sum: number, g) => sum + (g.max_students || 0),
      0,
    );

    return {
      id: p.course.course_id,
      course_name: p.course.course_name,
      course_code: p.course.course_code,
      course_type: p.course.course_type,
      session_duration: p.course.session_duration,
      title_ar: p.title_ar,
      description: p.description,
      description_ar: p.description_ar,
      language: p.language,
      level: p.level,
      flag_emoji: p.flag_emoji,
      price: p.price,
      currency: p.currency || "DZD",
      fee_amount: p.course.fee_amount,
      session_name: p.session_name,
      start_date: p.start_date,
      end_date: p.end_date,
      registration_open: p.registration_open,
      image_url: p.image_url,
      enrolled: totalEnrolled,
      capacity: totalCapacity,
    };
  });

  return {
    data,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getPublicCourseById(courseId: string) {
  const profile = await prisma.courseProfile.findFirst({
    where: { course_id: courseId, is_published: true },
    include: {
      pricing: { orderBy: { sort_order: "asc" } },
      course: {
        select: {
          course_id: true,
          course_name: true,
          course_code: true,
          fee_amount: true,
          course_type: true,
          session_duration: true,
          groups: {
            select: {
              group_id: true,
              name: true,
              level: true,
              max_students: true,
              teacher: { select: { first_name: true, last_name: true } },
              _count: {
                select: {
                  enrollments: {
                    where: {
                      registration_status: {
                        in: ["VALIDATED", "PAID", "FINISHED"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) return null;

  const { course } = profile;
  const totalEnrolled = course.groups.reduce(
    (s: number, g) => s + g._count.enrollments,
    0,
  );
  const totalCapacity = course.groups.reduce(
    (s: number, g) => s + (g.max_students || 0),
    0,
  );

  return {
    id: course.course_id,
    course_name: course.course_name,
    course_code: course.course_code,
    course_type: course.course_type,
    session_duration: course.session_duration,
    title_ar: profile.title_ar,
    description: profile.description,
    description_ar: profile.description_ar,
    language: profile.language,
    level: profile.level,
    flag_emoji: profile.flag_emoji,
    price: profile.price,
    currency: profile.currency || "DZD",
    fee_amount: course.fee_amount,
    session_name: profile.session_name,
    start_date: profile.start_date,
    end_date: profile.end_date,
    registration_open: profile.registration_open,
    image_url: profile.image_url,
    enrolled: totalEnrolled,
    capacity: totalCapacity,
    pricing: profile.pricing.map((p) => ({
      id: p.pricing_id,
      status_fr: p.status_fr,
      status_ar: p.status_ar,
      status_en: p.status_en,
      price: Number(p.price),
      currency: p.currency,
      discount: p.discount,
    })),
    groups: course.groups.map((g) => ({
      id: g.group_id,
      name: g.name,
      level: g.level,
      max_students: g.max_students,
      enrolled: g._count.enrollments,
      teacher: g.teacher
        ? `${g.teacher.first_name} ${g.teacher.last_name}`
        : null,
    })),
  };
}
