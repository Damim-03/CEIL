// ================================================================
// 📦 src/services/enrollment.service.ts
// ✅ Enrollment management — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { RegistrationStatus } from "../../../generated/prisma/client";
import {
  emitToAdminLevel,
  emitToUser,
  triggerDashboardRefresh,
} from "../socket.service";

// ─── LIST ────────────────────────────────────────────────

export async function listEnrollments() {
  return prisma.enrollment.findMany({
    include: {
      student: { include: { documents: true } },
      course: {
        include: {
          profile: {
            include: { pricing: { orderBy: { sort_order: "asc" } } },
          },
          groups: {
            include: {
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
      fees: true,
      group: true,
      pricing: {
        select: {
          pricing_id: true,
          status_fr: true,
          status_ar: true,
          status_en: true,
          price: true,
          currency: true,
          discount: true,
        },
      },
    },
    orderBy: { enrollment_date: "desc" },
  });
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getEnrollmentById(enrollmentId: string) {
  return prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
    include: {
      student: true,
      course: {
        include: {
          profile: {
            include: { pricing: { orderBy: { sort_order: "asc" } } },
          },
        },
      },
      fees: true,
      history: true,
      group: true,
      pricing: {
        select: {
          pricing_id: true,
          status_fr: true,
          status_ar: true,
          status_en: true,
          price: true,
          currency: true,
          discount: true,
        },
      },
    },
  });
}

// ─── VALIDATE ────────────────────────────────────────────

export async function validateEnrollment(
  enrollmentId: string,
  options: { pricing_id_override?: string; changedBy?: string } = {},
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
    include: {
      course: {
        include: {
          profile: { include: { pricing: true } },
        },
      },
      student: true,
      pricing: true,
    },
  });

  if (!enrollment) return { error: "not_found" as const };

  if (enrollment.registration_status !== "PENDING") {
    return { error: "not_pending" as const };
  }

  const profile = enrollment.course?.profile;
  const pricingTiers = profile?.pricing || [];

  let feeAmount: number = 0;
  let selectedPricing: any = null;

  // CASE 1: Course has pricing tiers
  if (pricingTiers.length > 0) {
    const effectivePricingId =
      options.pricing_id_override || enrollment.pricing_id;

    if (effectivePricingId) {
      selectedPricing = pricingTiers.find(
        (p) => p.pricing_id === effectivePricingId,
      );
      if (!selectedPricing) return { error: "invalid_pricing" as const };
    } else {
      // Use lowest price
      selectedPricing = pricingTiers.reduce((min, p) =>
        Number(p.price) < Number(min.price) ? p : min,
      );
    }

    feeAmount = Number(selectedPricing.price);
    if (isNaN(feeAmount) || feeAmount <= 0) {
      return { error: "invalid_amount" as const };
    }
  }
  // CASE 2: Profile has base price
  else if (profile?.price && Number(profile.price) > 0) {
    feeAmount = Number(profile.price);
  }
  // CASE 3: No pricing
  else {
    return {
      error: "no_pricing" as const,
      details: {
        course_id: enrollment.course_id,
        course_name: enrollment.course?.course_name,
        has_profile: !!profile,
        has_pricing_tiers: pricingTiers.length > 0,
        has_base_price: !!profile?.price,
      },
    };
  }

  // ─── Transaction ───
  const result = await prisma.$transaction(async (tx) => {
    const updateData: any = { registration_status: "VALIDATED" };
    if (selectedPricing) updateData.pricing_id = selectedPricing.pricing_id;

    const updatedEnrollment = await tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: updateData,
    });

    let fee = null;
    if (feeAmount > 0) {
      fee = await tx.fee.create({
        data: {
          student_id: enrollment.student_id,
          enrollment_id: enrollmentId,
          amount: feeAmount,
          status: "UNPAID",
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: "PENDING",
        new_status: "VALIDATED",
        changed_by: options.changedBy,
      },
    });

    return { enrollment: updatedEnrollment, fee };
  });

  // 🔌 Socket
  emitToAdminLevel("enrollment:statusChanged", {
    enrollment_id: enrollmentId,
    old_status: "PENDING",
    new_status: "VALIDATED",
    student_name: enrollment.student
      ? `${enrollment.student.first_name} ${enrollment.student.last_name}`
      : undefined,
    course_name: enrollment.course?.course_name,
  });

  const studentUser = await prisma.user.findFirst({
    where: { student_id: enrollment.student_id },
    select: { user_id: true },
  });
  if (studentUser) {
    emitToUser(studentUser.user_id, "enrollment:statusChanged", {
      enrollment_id: enrollmentId,
      old_status: "PENDING",
      new_status: "VALIDATED",
    });
  }
  triggerDashboardRefresh("enrollment_validated");

  return {
    data: result,
    pricing_used: selectedPricing
      ? {
          id: selectedPricing.pricing_id,
          status_fr: selectedPricing.status_fr,
          status_ar: selectedPricing.status_ar,
          price: Number(selectedPricing.price),
          currency: selectedPricing.currency,
        }
      : null,
    feeAmount,
  };
}

// ─── REJECT ──────────────────────────────────────────────

export async function rejectEnrollment(
  enrollmentId: string,
  reason: string,
  changedBy?: string,
) {
  if (!reason?.trim()) return { error: "reason_required" as const };

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
    include: {
      student: {
        select: {
          student_id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      course: { select: { course_id: true, course_name: true } },
    },
  });

  if (!enrollment) return { error: "not_found" as const };

  if (enrollment.registration_status !== RegistrationStatus.PENDING) {
    return { error: "not_pending" as const };
  }

  const studentInfo = {
    id: enrollment.student.student_id,
    name: `${enrollment.student.first_name} ${enrollment.student.last_name}`,
    email: enrollment.student.email,
  };
  const courseInfo = {
    id: enrollment.course.course_id,
    name: enrollment.course.course_name,
  };

  await prisma.$transaction(async (tx) => {
    await tx.fee.deleteMany({ where: { enrollment_id: enrollmentId } });
    await tx.registrationHistory.deleteMany({
      where: { enrollment_id: enrollmentId },
    });
    await tx.enrollment.delete({ where: { enrollment_id: enrollmentId } });
  });

  // 🔌 Socket
  const rejUser = await prisma.user.findFirst({
    where: { student_id: enrollment.student_id },
    select: { user_id: true },
  });
  emitToAdminLevel("enrollment:statusChanged", {
    enrollment_id: enrollmentId,
    old_status: "PENDING",
    new_status: "REJECTED",
    student_name: studentInfo.name,
    course_name: courseInfo.name,
  });
  if (rejUser) {
    emitToUser(rejUser.user_id, "enrollment:statusChanged", {
      enrollment_id: enrollmentId,
      old_status: "PENDING",
      new_status: "REJECTED",
    });
  }
  triggerDashboardRefresh("enrollment_rejected");

  return {
    data: {
      reason: reason.trim(),
      student: studentInfo,
      course: courseInfo,
    },
  };
}

// ─── MARK PAID ───────────────────────────────────────────

export async function markEnrollmentPaid(
  enrollmentId: string,
  changedBy?: string,
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) return { error: "not_found" as const };

  if (enrollment.registration_status !== RegistrationStatus.VALIDATED) {
    return { error: "not_validated" as const };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.PAID,
        changed_by: changedBy,
      },
    });

    const updatedEnrollment = await tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.PAID },
    });

    await tx.fee.updateMany({
      where: { enrollment_id: enrollmentId, status: "UNPAID" },
      data: {
        status: "PAID",
        paid_at: new Date(),
        payment_method: "Cash",
        reference_code: `PAY-${Date.now()}`,
      },
    });

    return updatedEnrollment;
  });

  // 🔌 Socket
  emitToAdminLevel("enrollment:statusChanged", {
    enrollment_id: enrollmentId,
    old_status: "VALIDATED",
    new_status: "PAID",
  });
  triggerDashboardRefresh("enrollment_paid");

  return { data: updated };
}

// ─── FINISH ──────────────────────────────────────────────

export async function finishEnrollment(
  enrollmentId: string,
  changedBy?: string,
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) return { error: "not_found" as const };

  if (enrollment.registration_status !== RegistrationStatus.PAID) {
    return { error: "not_paid" as const };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.FINISHED,
        changed_by: changedBy,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.FINISHED },
    });
  });

  // 🔌 Socket
  emitToAdminLevel("enrollment:statusChanged", {
    enrollment_id: enrollmentId,
    old_status: "PAID",
    new_status: "FINISHED",
  });
  triggerDashboardRefresh("enrollment_finished");

  return { data: updated };
}