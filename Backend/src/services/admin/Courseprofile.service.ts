// ================================================================
// 📦 src/services/courseProfile.service.ts
// ✅ Course Profile & Pricing — shared between Admin & Owner
// ================================================================

import { prisma } from "../../prisma/client";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";

// ─── Types ───────────────────────────────────────────────

interface UpsertProfileInput {
  courseId: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  language?: string;
  level?: string;
  flag_emoji?: string;
  price?: number | string;
  currency?: string;
  session_name?: string;
  start_date?: string;
  end_date?: string;
  registration_open?: boolean | string;
  is_published?: boolean | string;
  file?: Express.Multer.File;
}

interface AddPricingInput {
  status_fr: string;
  status_ar?: string;
  status_en?: string;
  price?: number | string;
  currency?: string;
  discount?: string;
  sort_order?: number | string;
}

// ══════════════════════════════════════════════
// COURSE PROFILE
// ══════════════════════════════════════════════

// ─── UPSERT (Create or Update) ───────────────────────────

export async function upsertCourseProfile(input: UpsertProfileInput) {
  const { courseId, file, ...fields } = input;

  const course = await prisma.course.findUnique({
    where: { course_id: courseId },
  });
  if (!course) return { error: "course_not_found" as const };

  let image_url: string | undefined;
  let image_public_id: string | undefined;

  if (file) {
    const result = await uploadToCloudinary(file, "course-profiles");
    image_url = result.secure_url;
    image_public_id = result.public_id;
  }

  const data: any = {
    title_ar: fields.title_ar,
    description: fields.description,
    description_ar: fields.description_ar,
    language: fields.language,
    level: fields.level,
    flag_emoji: fields.flag_emoji,
    price:
      fields.price !== undefined ? Number(fields.price) : undefined,
    currency: fields.currency,
    session_name: fields.session_name,
    start_date: fields.start_date
      ? new Date(fields.start_date)
      : undefined,
    end_date: fields.end_date ? new Date(fields.end_date) : undefined,
    registration_open:
      fields.registration_open !== undefined
        ? fields.registration_open === "true" ||
          fields.registration_open === true
        : undefined,
    is_published:
      fields.is_published !== undefined
        ? fields.is_published === "true" || fields.is_published === true
        : undefined,
  };

  if (image_url) {
    data.image_url = image_url;
    data.image_public_id = image_public_id;
  }

  // Remove undefined keys
  Object.keys(data).forEach(
    (k) => data[k] === undefined && delete data[k],
  );

  const profile = await prisma.courseProfile.upsert({
    where: { course_id: courseId },
    create: { course_id: courseId, ...data },
    update: data,
    include: { pricing: { orderBy: { sort_order: "asc" } } },
  });

  return { data: profile };
}

// ─── GET ─────────────────────────────────────────────────

export async function getCourseProfile(courseId: string) {
  return prisma.courseProfile.findUnique({
    where: { course_id: courseId },
    include: {
      pricing: { orderBy: { sort_order: "asc" } },
      course: {
        select: {
          course_id: true,
          course_name: true,
          course_code: true,
        },
      },
    },
  });
}

// ─── PUBLISH / UNPUBLISH ─────────────────────────────────

export async function publishCourseProfile(courseId: string) {
  try {
    return await prisma.courseProfile.update({
      where: { course_id: courseId },
      data: { is_published: true },
    });
  } catch {
    return null;
  }
}

export async function unpublishCourseProfile(courseId: string) {
  try {
    return await prisma.courseProfile.update({
      where: { course_id: courseId },
      data: { is_published: false },
    });
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════
// COURSE PRICING
// ══════════════════════════════════════════════

// ─── GET PRICING ─────────────────────────────────────────

export async function getCoursePricing(courseId: string) {
  const profile = await prisma.courseProfile.findUnique({
    where: { course_id: courseId },
  });

  if (!profile) return { error: "profile_not_found" as const };

  const pricing = await prisma.coursePricing.findMany({
    where: { profile_id: profile.profile_id },
    orderBy: { sort_order: "asc" },
  });

  return { data: pricing };
}

// ─── ADD PRICING ─────────────────────────────────────────

export async function addCoursePricing(
  courseId: string,
  input: AddPricingInput,
) {
  const profile = await prisma.courseProfile.findUnique({
    where: { course_id: courseId },
  });

  if (!profile) return { error: "profile_not_found" as const };

  if (!input.status_fr?.trim()) {
    return { error: "status_fr_required" as const };
  }

  const pricing = await prisma.coursePricing.create({
    data: {
      profile_id: profile.profile_id,
      status_fr: input.status_fr.trim(),
      status_ar: input.status_ar?.trim() || null,
      status_en: input.status_en?.trim() || null,
      price: input.price ? Number(input.price) : 0,
      currency: input.currency || "DA",
      discount: input.discount || "Aucune",
      sort_order: input.sort_order ? Number(input.sort_order) : 0,
    },
  });

  return { data: pricing };
}

// ─── UPDATE PRICING ──────────────────────────────────────

export async function updateCoursePricing(
  pricingId: string,
  input: Partial<AddPricingInput>,
) {
  try {
    const pricing = await prisma.coursePricing.update({
      where: { pricing_id: pricingId },
      data: {
        status_fr: input.status_fr?.trim(),
        status_ar: input.status_ar?.trim(),
        status_en: input.status_en?.trim(),
        price:
          input.price !== undefined ? Number(input.price) : undefined,
        currency: input.currency,
        discount: input.discount,
        sort_order:
          input.sort_order !== undefined
            ? Number(input.sort_order)
            : undefined,
      },
    });

    return { data: pricing };
  } catch {
    return { error: "not_found" as const };
  }
}

// ─── DELETE PRICING ──────────────────────────────────────

export async function deleteCoursePricing(pricingId: string) {
  try {
    await prisma.coursePricing.delete({
      where: { pricing_id: pricingId },
    });
    return { data: true };
  } catch {
    return { error: "not_found" as const };
  }
}