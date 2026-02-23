// ================================================================
// 📌 src/controllers/admin/Courseprofile.controller.ts
// ✅ Refactored: Uses CourseProfileService
// ================================================================

import { Request, Response } from "express";
import * as CourseProfileService from "../../services/admin/Courseprofile.service";

// ══════════════════════════════════════════════
// COURSE PROFILE CRUD
// ══════════════════════════════════════════════

/** POST /admin/courses/:courseId/profile — إنشاء أو تحديث */
export const createOrUpdateCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await CourseProfileService.upsertCourseProfile({
      courseId: req.params.courseId,
      ...req.body,
      file: req.file,
    });

    if ("error" in result) {
      if (result.error === "course_not_found")
        return res.status(404).json({ message: "Course not found" });
    }

    return res.json(result.data);
  } catch (error) {
    console.error("Error creating/updating course profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** GET /admin/courses/:courseId/profile */
export const getCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const profile = await CourseProfileService.getCourseProfile(
      req.params.courseId,
    );

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json(profile);
  } catch (error) {
    console.error("Error fetching course profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** PATCH /admin/courses/:courseId/profile/publish */
export const publishCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  const profile = await CourseProfileService.publishCourseProfile(
    req.params.courseId,
  );
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  return res.json(profile);
};

/** PATCH /admin/courses/:courseId/profile/unpublish */
export const unpublishCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  const profile = await CourseProfileService.unpublishCourseProfile(
    req.params.courseId,
  );
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  return res.json(profile);
};

// ══════════════════════════════════════════════
// COURSE PRICING CRUD
// ══════════════════════════════════════════════

/** GET /admin/courses/:courseId/pricing */
export const getCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await CourseProfileService.getCoursePricing(
      req.params.courseId,
    );

    if ("error" in result)
      return res.status(404).json({ message: "Profile not found" });
    return res.json(result.data);
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** POST /admin/courses/:courseId/pricing */
export const addCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await CourseProfileService.addCoursePricing(
      req.params.courseId,
      req.body,
    );

    if ("error" in result) {
      if (result.error === "profile_not_found")
        return res
          .status(404)
          .json({ message: "Profile not found. Create profile first." });
      if (result.error === "status_fr_required")
        return res.status(400).json({ message: "status_fr is required" });
    }

    return res.status(201).json(result.data);
  } catch (error) {
    console.error("Error adding pricing:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** PUT /admin/courses/:courseId/pricing/:pricingId */
export const updateCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  const result = await CourseProfileService.updateCoursePricing(
    req.params.pricingId,
    req.body,
  );

  if ("error" in result)
    return res.status(404).json({ message: "Pricing not found" });
  return res.json(result.data);
};

/** DELETE /admin/courses/:courseId/pricing/:pricingId */
export const deleteCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  const result = await CourseProfileService.deleteCoursePricing(
    req.params.pricingId,
  );

  if ("error" in result)
    return res.status(404).json({ message: "Pricing not found" });
  return res.json({ message: "Pricing deleted" });
};
