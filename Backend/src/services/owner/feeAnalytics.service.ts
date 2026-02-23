// ================================================================
// src/services/owner/feeAnalytics.service.ts
// ✅ Safe version — handles missing relations gracefully
// ================================================================

import { prisma } from "../../prisma/client";

interface FeeAnalyticsParams {
  period?: "daily" | "monthly" | "yearly";
  date?: string;
  page?: number;
  limit?: number;
}

export async function getFeeAnalytics(params: FeeAnalyticsParams) {
  const { period = "monthly", date, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  // ── 1. Calculate date range ──
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  if (period === "daily") {
    const d = date || now.toISOString().split("T")[0];
    startDate = new Date(`${d}T00:00:00.000Z`);
    endDate = new Date(`${d}T23:59:59.999Z`);
    periodLabel = d;
  } else if (period === "yearly") {
    const year = date ? parseInt(date) : now.getFullYear();
    startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    periodLabel = String(year);
  } else {
    // monthly
    const parts = date
      ? date.split("-")
      : [
          String(now.getFullYear()),
          String(now.getMonth() + 1).padStart(2, "0"),
        ];
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const lastDay = new Date(year, month, 0).getDate();
    startDate = new Date(
      `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`,
    );
    endDate = new Date(
      `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`,
    );
    periodLabel = `${year}-${String(month).padStart(2, "0")}`;
  }

  // ── 2. Aggregates ──
  const [paidAgg, unpaidAgg, totalCount] = await Promise.all([
    prisma.fee.aggregate({
      where: {
        status: "PAID",
        paid_at: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: {
        status: { not: "PAID" },
        OR: [
          { due_date: { gte: startDate, lte: endDate } },
          { due_date: { lt: startDate } },
        ],
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.count({
      where: {
        OR: [
          { paid_at: { gte: startDate, lte: endDate } },
          { due_date: { gte: startDate, lte: endDate } },
          { status: { not: "PAID" }, due_date: { lt: startDate } },
        ],
      },
    }),
  ]);

  // ── 3. Paid fees list ──
  const paidFees = await prisma.fee.findMany({
    where: {
      status: "PAID",
      paid_at: { gte: startDate, lte: endDate },
    },
    include: {
      enrollment: {
        include: {
          student: {
            select: {
              student_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          course: {
            select: { course_id: true, course_name: true, course_code: true },
          },
        },
      },
    },
    orderBy: { paid_at: "desc" },
    skip,
    take: limit,
  });

  // ── 4. Unpaid fees list ──
  const unpaidFees = await prisma.fee.findMany({
    where: {
      status: { not: "PAID" },
      OR: [
        { due_date: { gte: startDate, lte: endDate } },
        { due_date: { lt: startDate } },
      ],
    },
    include: {
      enrollment: {
        include: {
          student: {
            select: {
              student_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          course: {
            select: { course_id: true, course_name: true, course_code: true },
          },
        },
      },
    },
    orderBy: { due_date: "asc" },
    skip,
    take: limit,
  });

  // ── 5. Daily breakdown ──
  let dailyBreakdown: any[] = [];
  if (period === "monthly" || period === "yearly") {
    try {
      const rawPaid = await prisma.$queryRawUnsafe<any[]>(
        `SELECT DATE("paid_at") as date, COUNT(*)::int as count, COALESCE(SUM(amount), 0)::float as total
         FROM "Fee" WHERE status = 'PAID' AND "paid_at" >= $1 AND "paid_at" <= $2
         GROUP BY DATE("paid_at") ORDER BY date ASC`,
        startDate,
        endDate,
      );
      dailyBreakdown = rawPaid.map((row: any) => ({
        date: row.date,
        paid_count: row.count,
        paid_total: row.total,
      }));
    } catch (err) {
      console.error("Daily breakdown query failed:", err);
    }
  }

  // ── 6. Monthly breakdown ──
  let monthlyBreakdown: any[] = [];
  if (period === "yearly") {
    try {
      const rawMonthly = await prisma.$queryRawUnsafe<any[]>(
        `SELECT EXTRACT(MONTH FROM "paid_at")::int as month, COUNT(*)::int as count, COALESCE(SUM(amount), 0)::float as total
         FROM "Fee" WHERE status = 'PAID' AND "paid_at" >= $1 AND "paid_at" <= $2
         GROUP BY EXTRACT(MONTH FROM "paid_at") ORDER BY month ASC`,
        startDate,
        endDate,
      );
      monthlyBreakdown = rawMonthly.map((row: any) => ({
        month: row.month,
        paid_count: row.count,
        paid_total: row.total,
      }));
    } catch (err) {
      console.error("Monthly breakdown query failed:", err);
    }
  }

  // ── 7. Overall stats ──
  const [overallPaid, overallUnpaid, overallTotal] = await Promise.all([
    prisma.fee.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: { status: { not: "PAID" } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.count(),
  ]);

  return {
    period,
    period_label: periodLabel,
    date_range: { start: startDate.toISOString(), end: endDate.toISOString() },

    summary: {
      paid_count: paidAgg._count,
      paid_total: Number(paidAgg._sum.amount ?? 0),
      unpaid_count: unpaidAgg._count,
      unpaid_total: Number(unpaidAgg._sum.amount ?? 0),
      total_count: totalCount,
      total_amount:
        Number(paidAgg._sum.amount ?? 0) + Number(unpaidAgg._sum.amount ?? 0),
    },

    overall: {
      paid_count: overallPaid._count,
      paid_total: Number(overallPaid._sum.amount ?? 0),
      unpaid_count: overallUnpaid._count,
      unpaid_total: Number(overallUnpaid._sum.amount ?? 0),
      total_count: overallTotal,
    },

    paid_fees: paidFees.map(formatFee),
    unpaid_fees: unpaidFees.map(formatFee),
    daily_breakdown: dailyBreakdown,
    monthly_breakdown: monthlyBreakdown,

    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
  };
}

function formatFee(fee: any) {
  const student = fee.enrollment?.student;
  return {
    fee_id: fee.fee_id,
    amount: Number(fee.amount),
    status: fee.status,
    due_date: fee.due_date?.toISOString() ?? null,
    paid_at: fee.paid_at?.toISOString() ?? null,
    payment_method: fee.payment_method ?? null,
    reference_code: fee.reference_code ?? null,
    created_at: fee.created_at?.toISOString() ?? null,
    student: student
      ? {
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email ?? null,
        }
      : null,
    course: fee.enrollment?.course
      ? {
          course_id: fee.enrollment.course.course_id,
          course_name: fee.enrollment.course.course_name,
          course_code: fee.enrollment.course.course_code,
        }
      : null,
  };
}
