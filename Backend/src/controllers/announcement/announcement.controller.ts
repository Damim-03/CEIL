import { Request, Response } from "express";
import { prisma } from "../../prisma/client";

/* ======================================================
   HOME STATS
   GET /api/public/home/stats
====================================================== */
export const getPublicHomeStatsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const [studentsCount, publishedProfiles] = await Promise.all([
      prisma.student.count(),
      prisma.courseProfile.findMany({
        where: { is_published: true },
        select: { language: true },
      }),
    ]);

    const uniqueLanguages = new Set(
      publishedProfiles.map((p: { language: string | null }) => p.language).filter(Boolean),
    );

    return res.json({
      languages_count: uniqueLanguages.size,
      students_count: studentsCount,
      courses_count: publishedProfiles.length,
    });
  } catch (error) {
    console.error("Error fetching home stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   PUBLIC ANNOUNCEMENTS (published only)
   GET /api/public/announcements?page=1&limit=10&category=NEWS
====================================================== */
export const getPublicAnnouncementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { page = "1", limit = "10", category } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { is_published: true };

    if (category) {
      where.category = (category as string).toUpperCase();
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
          published_at: true,
          created_at: true,
        },
        orderBy: { published_at: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.announcement.count({ where }),
    ]);

    return res.json({
      data: announcements.map((a) => ({
        id: a.announcement_id,
        title: a.title,
        title_ar: a.title_ar,
        excerpt: a.excerpt,
        excerpt_ar: a.excerpt_ar,
        category: a.category,
        image_url: a.image_url,
        date: a.published_at || a.created_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching public announcements:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   PUBLIC ANNOUNCEMENT DETAIL
   GET /api/public/announcements/:announcementId
====================================================== */
export const getPublicAnnouncementByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { announcementId } = req.params;

    const announcement = await prisma.announcement.findFirst({
      where: {
        announcement_id: announcementId,
        is_published: true,
      },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.json({
      id: announcement.announcement_id,
      title: announcement.title,
      title_ar: announcement.title_ar,
      content: announcement.content,
      content_ar: announcement.content_ar,
      excerpt: announcement.excerpt,
      excerpt_ar: announcement.excerpt_ar,
      category: announcement.category,
      image_url: announcement.image_url,
      date: announcement.published_at || announcement.created_at,
    });
  } catch (error) {
    console.error("Error fetching public announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   PUBLIC COURSES (published only)
   GET /api/public/courses?page=1&limit=12&language=FRENCH
====================================================== */
export const getPublicCoursesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { page = "1", limit = "12", language } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const profileWhere: any = { is_published: true };
    if (language) {
      profileWhere.language = (language as string).toUpperCase();
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
        take: limitNum,
      }),
      prisma.courseProfile.count({ where: profileWhere }),
    ]);

    const transformed = profiles.map((p) => {
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

    return res.json({
      data: transformed,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   PUBLIC COURSE DETAIL
   GET /api/public/courses/:courseId
====================================================== */
export const getPublicCourseByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { courseId } = req.params;

    const profile = await prisma.courseProfile.findFirst({
      where: {
        course_id: courseId,
        is_published: true,
      },
      include: {
        pricing: { orderBy: { sort_order: "asc" } },  // ← الإضافة الوحيدة
        course: {
          select: {
            course_id: true,
            course_name: true,
            course_code: true,
            fee_amount: true,
            groups: {
              select: {
                group_id: true,
                name: true,
                level: true,
                max_students: true,
                teacher: {
                  select: { first_name: true, last_name: true },
                },
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

    if (!profile) {
      return res.status(404).json({ message: "Course not found" });
    }

    const { course } = profile;
    const totalEnrolled = course.groups.reduce(
      (s: number, g) => s + g._count.enrollments,
      0,
    );
    const totalCapacity = course.groups.reduce(
      (s: number, g) => s + (g.max_students || 0),
      0,
    );

    return res.json({
      id: course.course_id,
      course_name: course.course_name,
      course_code: course.course_code,
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

      // ← التعرفة حسب الصفة
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
    });
  } catch (error) {
    console.error("Error fetching public course:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};