import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";

// ══════════════════════════════════════════════
// COURSE PROFILE CRUD (Admin)
// ══════════════════════════════════════════════

/** POST /admin/courses/:courseId/profile — إنشاء أو تحديث */
export const createOrUpdateCourseProfileController = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { course_id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const {
      title_ar, description, description_ar,
      language, level, flag_emoji,
      price, currency,
      session_name, start_date, end_date,
      registration_open, is_published,
    } = req.body;

    let image_url: string | undefined;
    let image_public_id: string | undefined;

    if (req.file) {
      const result = await uploadToCloudinary(req.file, "course-profiles");
      image_url = result.secure_url;
      image_public_id = result.public_id;
    }

    const data: any = {
      title_ar, description, description_ar,
      language, level, flag_emoji,
      price: price !== undefined ? Number(price) : undefined,
      currency,
      session_name,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      registration_open: registration_open !== undefined
        ? (registration_open === "true" || registration_open === true)
        : undefined,
      is_published: is_published !== undefined
        ? (is_published === "true" || is_published === true)
        : undefined,
    };

    if (image_url) {
      data.image_url = image_url;
      data.image_public_id = image_public_id;
    }

    // Remove undefined
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    const profile = await prisma.courseProfile.upsert({
      where: { course_id: courseId },
      create: { course_id: courseId, ...data },
      update: data,
      include: { pricing: { orderBy: { sort_order: "asc" } } },
    });

    return res.json(profile);
  } catch (error) {
    console.error("Error creating/updating course profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** GET /admin/courses/:courseId/profile */
export const getCourseProfileController = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const profile = await prisma.courseProfile.findUnique({
      where: { course_id: courseId },
      include: {
        pricing: { orderBy: { sort_order: "asc" } },
        course: { select: { course_id: true, course_name: true, course_code: true } },
      },
    });

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json(profile);
  } catch (error) {
    console.error("Error fetching course profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** PATCH /admin/courses/:courseId/profile/publish */
export const publishCourseProfileController = async (req: Request, res: Response) => {
  try {
    const profile = await prisma.courseProfile.update({
      where: { course_id: req.params.courseId },
      data: { is_published: true },
    });
    return res.json(profile);
  } catch (error) {
    return res.status(404).json({ message: "Profile not found" });
  }
};

/** PATCH /admin/courses/:courseId/profile/unpublish */
export const unpublishCourseProfileController = async (req: Request, res: Response) => {
  try {
    const profile = await prisma.courseProfile.update({
      where: { course_id: req.params.courseId },
      data: { is_published: false },
    });
    return res.json(profile);
  } catch (error) {
    return res.status(404).json({ message: "Profile not found" });
  }
};

// ══════════════════════════════════════════════
// COURSE PRICING CRUD (Admin)
// ══════════════════════════════════════════════

/** GET /admin/courses/:courseId/pricing */
export const getCoursePricingController = async (req: Request, res: Response) => {
  try {
    const profile = await prisma.courseProfile.findUnique({
      where: { course_id: req.params.courseId },
    });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const pricing = await prisma.coursePricing.findMany({
      where: { profile_id: profile.profile_id },
      orderBy: { sort_order: "asc" },
    });
    return res.json(pricing);
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** POST /admin/courses/:courseId/pricing */
export const addCoursePricingController = async (req: Request, res: Response) => {
  try {
    const profile = await prisma.courseProfile.findUnique({
      where: { course_id: req.params.courseId },
    });
    if (!profile) return res.status(404).json({ message: "Profile not found. Create profile first." });

    const { status_fr, status_ar, status_en, price, currency, discount, sort_order } = req.body;

    if (!status_fr?.trim()) {
      return res.status(400).json({ message: "status_fr is required" });
    }

    const pricing = await prisma.coursePricing.create({
      data: {
        profile_id: profile.profile_id,
        status_fr: status_fr.trim(),
        status_ar: status_ar?.trim() || null,
        status_en: status_en?.trim() || null,
        price: price ? Number(price) : 0,
        currency: currency || "DA",
        discount: discount || "Aucune",
        sort_order: sort_order ? Number(sort_order) : 0,
      },
    });

    return res.status(201).json(pricing);
  } catch (error) {
    console.error("Error adding pricing:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** PUT /admin/courses/:courseId/pricing/:pricingId */
export const updateCoursePricingController = async (req: Request, res: Response) => {
  try {
    const { pricingId } = req.params;
    const { status_fr, status_ar, status_en, price, currency, discount, sort_order } = req.body;

    const pricing = await prisma.coursePricing.update({
      where: { pricing_id: pricingId },
      data: {
        status_fr: status_fr?.trim(),
        status_ar: status_ar?.trim(),
        status_en: status_en?.trim(),
        price: price !== undefined ? Number(price) : undefined,
        currency,
        discount,
        sort_order: sort_order !== undefined ? Number(sort_order) : undefined,
      },
    });

    return res.json(pricing);
  } catch (error) {
    return res.status(404).json({ message: "Pricing not found" });
  }
};

/** DELETE /admin/courses/:courseId/pricing/:pricingId */
export const deleteCoursePricingController = async (req: Request, res: Response) => {
  try {
    await prisma.coursePricing.delete({ where: { pricing_id: req.params.pricingId } });
    return res.json({ message: "Pricing deleted" });
  } catch (error) {
    return res.status(404).json({ message: "Pricing not found" });
  }
};