// src/controllers/admin/teacherSchedule.controller.ts

import { Request, Response } from "express";
import { prisma } from "../../prisma/client";

const DAYS_AR: Record<number, string> = {
  0: "السبت",
  1: "الأحد",
  2: "الإثنين",
  3: "الثلاثاء",
  4: "الأربعاء",
  5: "الخميس",
};

// ── helpers ───────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

async function checkTeacherConflict(
  teacher_id: string,
  day_of_week: number,
  start_time: string,
  end_time: string,
  excludeId?: string,
): Promise<{ conflict: boolean; existing?: any }> {
  const entries = await prisma.teacherScheduleEntry.findMany({
    where: {
      teacher_id,
      day_of_week,
      ...(excludeId ? { NOT: { entry_id: excludeId } } : {}),
    },
  });

  const newStart = timeToMinutes(start_time);
  const newEnd = timeToMinutes(end_time);

  for (const e of entries) {
    const eStart = timeToMinutes(e.start_time);
    const eEnd = timeToMinutes(e.end_time);
    if (newStart < eEnd && newEnd > eStart) {
      return { conflict: true, existing: e };
    }
  }
  return { conflict: false };
}

// Include للـ admin — كامل
const INCLUDE_ADMIN = {
  teacher: {
    select: {
      teacher_id: true,
      first_name: true,
      last_name: true,
      user: { select: { google_avatar: true, email: true } },
    },
  },
  group: {
    select: {
      group_id: true,
      name: true,
      level: true,
      course: {
        select: { course_id: true, course_name: true, course_code: true },
      },
    },
  },
  room: { select: { room_id: true, name: true } },
};

// Include للأستاذ — بدون بيانات حساسة
const INCLUDE_TEACHER = {
  group: {
    select: {
      group_id: true,
      name: true,
      level: true,
      course: {
        select: { course_id: true, course_name: true, course_code: true },
      },
    },
  },
  room: { select: { room_id: true, name: true } },
};

// ══════════════════════════════════════════════════════════════
//  GET /admin/teacher-schedule
//  Query: teacher_id?, day_of_week?, language?
// ══════════════════════════════════════════════════════════════
export async function getAllTeacherScheduleController(
  req: Request,
  res: Response,
) {
  try {
    const { teacher_id, day_of_week, language } = req.query as Record<
      string,
      string
    >;

    const where: any = {};
    if (teacher_id) where.teacher_id = teacher_id;
    if (language) where.language = language;
    if (day_of_week !== undefined) where.day_of_week = parseInt(day_of_week);

    const entries = await prisma.teacherScheduleEntry.findMany({
      where,
      include: INCLUDE_ADMIN,
      orderBy: [
        { teacher_id: "asc" },
        { day_of_week: "asc" },
        { start_time: "asc" },
      ],
    });

    return res.json({ success: true, total: entries.length, data: entries });
  } catch (error) {
    console.error("[teacherSchedule] getAll:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  GET /admin/teacher-schedule/teacher/:teacherId
//  جدول أستاذ كامل أسبوعياً (للإدارة)
// ══════════════════════════════════════════════════════════════
export async function getTeacherScheduleByIdController(
  req: Request,
  res: Response,
) {
  try {
    const { teacherId } = req.params;

    const [teacher, entries] = await Promise.all([
      prisma.teacher.findUnique({
        where: { teacher_id: teacherId },
        select: {
          teacher_id: true,
          first_name: true,
          last_name: true,
          email: true,
          user: {
            select: { google_avatar: true, email: true, is_active: true },
          },
          groups: {
            select: {
              group_id: true,
              name: true,
              level: true,
              status: true,
              course: { select: { course_name: true } },
            },
          },
        },
      }),
      prisma.teacherScheduleEntry.findMany({
        where: { teacher_id: teacherId },
        include: INCLUDE_ADMIN,
        orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
      }),
    ]);

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "الأستاذ غير موجود" });
    }

    const weekly: Record<number, any[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };
    for (const e of entries) weekly[e.day_of_week].push(e);

    return res.json({
      success: true,
      teacher,
      weekly,
      entries,
      total: entries.length,
    });
  } catch (error) {
    console.error("[teacherSchedule] getTeacher:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  GET /teachers/me/timetable
//  للأستاذ نفسه — يرى جدوله الأسبوعي الثابت
//
//  Response يطابق TeacherTimetableResponse في الـ frontend:
//  { teacher_id, teacher_name, entries: TeacherTimetableEntry[] }
// ══════════════════════════════════════════════════════════════
export async function getMyScheduleController(req: Request, res: Response) {
  try {
    // auth middleware يضع user_id وليس teacher_id مباشرة
    // نجلب Teacher record عبر user_id
    const userId = (req as any).user?.user_id;

    if (!userId) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    // جلب Teacher من user_id
    const teacher = await prisma.teacher.findFirst({
      where: { user: { user_id: userId } },
      select: { teacher_id: true, first_name: true, last_name: true },
    });

    if (!teacher) {
      return res.status(404).json({ message: "ملف الأستاذ غير موجود" });
    }

    const entries = await prisma.teacherScheduleEntry.findMany({
      where: { teacher_id: teacher.teacher_id },
      include: INCLUDE_TEACHER,
      orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
    });

    // يطابق TeacherTimetableResponse في useMyTimetable hook
    return res.json({
      teacher_id: teacher.teacher_id,
      teacher_name: `${teacher.first_name} ${teacher.last_name}`,
      entries,
    });
  } catch (error) {
    console.error("[teacherSchedule] getMySchedule:", error);
    return res.status(500).json({ message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  POST /admin/teacher-schedule
// ══════════════════════════════════════════════════════════════
export async function createTeacherScheduleController(
  req: Request,
  res: Response,
) {
  try {
    const {
      teacher_id,
      group_id,
      room_id,
      day_of_week,
      start_time,
      end_time,
      language,
      level,
      group_label,
      notes,
    } = req.body;

    const teacher = await prisma.teacher.findUnique({ where: { teacher_id } });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "الأستاذ غير موجود" });
    }

    const { conflict, existing } = await checkTeacherConflict(
      teacher_id,
      Number(day_of_week),
      start_time,
      end_time,
    );
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "تعارض: الأستاذ لديه حصة في هذه الفترة",
        conflict: {
          day: DAYS_AR[existing.day_of_week],
          slot: `${existing.start_time} - ${existing.end_time}`,
          group_label: existing.group_label,
        },
      });
    }

    const entry = await prisma.teacherScheduleEntry.create({
      data: {
        teacher_id,
        group_id: group_id || null,
        room_id: room_id || null,
        day_of_week: Number(day_of_week),
        start_time,
        end_time,
        language,
        level,
        group_label: group_label.trim(),
        notes: notes || null,
        created_by: (req as any).user?.user_id || null,
      },
      include: INCLUDE_ADMIN,
    });

    return res.status(201).json({
      success: true,
      message: "تمت إضافة الحصة بنجاح",
      data: entry,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "تعارض: الأستاذ مسجّل في هذا الوقت" });
    }
    console.error("[teacherSchedule] create:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  PUT /admin/teacher-schedule/:entryId
// ══════════════════════════════════════════════════════════════
export async function updateTeacherScheduleController(
  req: Request,
  res: Response,
) {
  try {
    const { entryId } = req.params;

    const existing = await prisma.teacherScheduleEntry.findUnique({
      where: { entry_id: entryId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "الحصة غير موجودة" });
    }

    const { day_of_week, start_time, end_time, ...rest } = req.body;

    const checkDay =
      day_of_week !== undefined ? Number(day_of_week) : existing.day_of_week;
    const checkStart = start_time ?? existing.start_time;
    const checkEnd = end_time ?? existing.end_time;

    const { conflict, existing: conflictWith } = await checkTeacherConflict(
      existing.teacher_id,
      checkDay,
      checkStart,
      checkEnd,
      entryId,
    );
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "تعارض في التوقيت بعد التعديل",
        conflict: {
          day: DAYS_AR[conflictWith.day_of_week],
          slot: `${conflictWith.start_time} - ${conflictWith.end_time}`,
        },
      });
    }

    const updated = await prisma.teacherScheduleEntry.update({
      where: { entry_id: entryId },
      data: {
        ...(day_of_week !== undefined && { day_of_week: Number(day_of_week) }),
        ...(start_time !== undefined && { start_time }),
        ...(end_time !== undefined && { end_time }),
        ...(rest.group_id !== undefined && { group_id: rest.group_id || null }),
        ...(rest.room_id !== undefined && { room_id: rest.room_id || null }),
        ...(rest.language !== undefined && { language: rest.language }),
        ...(rest.level !== undefined && { level: rest.level }),
        ...(rest.group_label !== undefined && {
          group_label: rest.group_label.trim(),
        }),
        ...(rest.notes !== undefined && { notes: rest.notes }),
      },
      include: INCLUDE_ADMIN,
    });

    return res.json({
      success: true,
      message: "تم تحديث الحصة",
      data: updated,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "تعارض في التوقيت" });
    }
    console.error("[teacherSchedule] update:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  DELETE /admin/teacher-schedule/:entryId
// ══════════════════════════════════════════════════════════════
export async function deleteTeacherScheduleController(
  req: Request,
  res: Response,
) {
  try {
    const { entryId } = req.params;

    const entry = await prisma.teacherScheduleEntry.findUnique({
      where: { entry_id: entryId },
    });
    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: "الحصة غير موجودة" });
    }

    await prisma.teacherScheduleEntry.delete({ where: { entry_id: entryId } });
    return res.json({ success: true, message: "تم حذف الحصة بنجاح" });
  } catch (error) {
    console.error("[teacherSchedule] delete:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  DELETE /admin/teacher-schedule/teacher/:teacherId/clear
// ══════════════════════════════════════════════════════════════
export async function clearTeacherScheduleController(
  req: Request,
  res: Response,
) {
  try {
    const { teacherId } = req.params;

    const { count } = await prisma.teacherScheduleEntry.deleteMany({
      where: { teacher_id: teacherId },
    });

    return res.json({
      success: true,
      message: `تم حذف ${count} حصة`,
      deleted: count,
    });
  } catch (error) {
    console.error("[teacherSchedule] clear:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}
