// ================================================================
// 📦 src/services/fee.service.ts
// ✅ Fee management — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import {
  FeeStatus,
  RegistrationStatus,
} from "../../../generated/prisma/client";
import {
  emitToAdminLevel,
  emitToUser,
  triggerDashboardRefresh,
} from "../socket.service";

// ─── LIST ────────────────────────────────────────────────

export async function listFees(params: {
  page?: number;
  limit?: number;
  excludePaid?: boolean;
}) {
  const page = params.page || 1;
  const limit = params.limit || 50;

  const where: any = params.excludePaid
    ? { status: { not: FeeStatus.PAID } }
    : {};

  const [fees, total] = await Promise.all([
    prisma.fee.findMany({
      where,
      include: { student: true, enrollment: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { due_date: "asc" },
    }),
    prisma.fee.count({ where }),
  ]);

  return {
    data: fees,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getFeeById(feeId: string) {
  return prisma.fee.findUnique({
    where: { fee_id: feeId },
    include: { student: true, enrollment: true },
  });
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateFee(
  feeId: string,
  body: Record<string, any>,
  adminUserId?: string,
) {
  if (Object.keys(body).length === 0) {
    return { error: "empty_body" as const };
  }

  const fee = await prisma.fee.findUnique({ where: { fee_id: feeId } });
  if (!fee) return { error: "not_found" as const };

  if (fee.status === FeeStatus.PAID) {
    return { error: "already_paid" as const };
  }

  const allowedFields = ["amount", "due_date"];
  const data: any = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key)),
  );

  data.processed_by = adminUserId;
  data.processed_at = new Date();

  const updated = await prisma.fee.update({
    where: { fee_id: feeId },
    data,
  });

  return { data: updated };
}

// ─── MARK AS PAID ────────────────────────────────────────

export async function markFeeAsPaid(
  feeId: string,
  options: {
    payment_method?: string;
    reference_code?: string;
    adminUserId?: string;
  } = {},
) {
  const fee = await prisma.fee.findUnique({
    where: { fee_id: feeId },
    include: { enrollment: true },
  });

  if (!fee) return { error: "not_found" as const };
  if (fee.status === FeeStatus.PAID) return { error: "already_paid" as const };

  const result = await prisma.$transaction(async (tx) => {
    // 1. Mark fee as PAID
    const updatedFee = await tx.fee.update({
      where: { fee_id: feeId },
      data: {
        status: FeeStatus.PAID,
        paid_at: new Date(),
        payment_method: options.payment_method || "Cash",
        reference_code: options.reference_code || `PAY-${Date.now()}`,
        processed_by: options.adminUserId,
        processed_at: new Date(),
      },
    });

    // 2. Auto-advance enrollment VALIDATED → PAID
    let updatedEnrollment = null;
    if (
      fee.enrollment_id &&
      fee.enrollment?.registration_status === RegistrationStatus.VALIDATED
    ) {
      await tx.registrationHistory.create({
        data: {
          enrollment_id: fee.enrollment_id,
          old_status: RegistrationStatus.VALIDATED,
          new_status: RegistrationStatus.PAID,
          changed_by: options.adminUserId,
        },
      });

      updatedEnrollment = await tx.enrollment.update({
        where: { enrollment_id: fee.enrollment_id },
        data: { registration_status: RegistrationStatus.PAID },
      });
    }

    return { fee: updatedFee, enrollment: updatedEnrollment };
  });

  // 🔌 Socket
  emitToAdminLevel("fee:paid", {
    fee_id: feeId,
    student_id: fee.student_id,
    amount: Number(fee.amount),
  });

  const studentUser = await prisma.user.findFirst({
    where: { student_id: fee.student_id },
    select: { user_id: true },
  });
  if (studentUser) {
    emitToUser(studentUser.user_id, "fee:paid", {
      fee_id: feeId,
      student_id: fee.student_id,
      amount: Number(fee.amount),
    });
  }
  triggerDashboardRefresh("fee_paid");

  return { data: result };
}

export async function correctFeeAmount(feeId: string, newAmount: number, adminUserId?: string) {
  if (!newAmount || newAmount <= 0) return { error: "invalid_amount" as const };
  const fee = await prisma.fee.findUnique({ where: { fee_id: feeId } });
  if (!fee) return { error: "not_found" as const };
  const oldAmount = Number(fee.amount);
  if (oldAmount === newAmount) return { error: "same_amount" as const };
  const updated = await prisma.fee.update({
    where: { fee_id: feeId },
    data: { amount: newAmount, processed_by: adminUserId, processed_at: new Date() },
  });
  triggerDashboardRefresh("fee_corrected");
  return { data: updated, correction: { old_amount: oldAmount, new_amount: newAmount, diff: newAmount - oldAmount } };
}