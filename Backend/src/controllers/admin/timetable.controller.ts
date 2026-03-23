// src/controllers/admin/timetable.controller.ts

import { Request, Response } from "express";
import { DAYS_AR } from "../../types/timetable.types";
import { prisma } from "../../prisma/client";

// ── helper ────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

async function checkRoomConflict(
  room_id: string,
  day_of_week: number,
  start_time: string,
  end_time: string,
  excludeId?: string,
): Promise<{ conflict: boolean; existing?: any }> {
  const entries = await prisma.timetableEntry.findMany({
    where: {
      room_id,
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

// ══════════════════════════════════════════════════════════════
//  GET /admin/timetable
// ══════════════════════════════════════════════════════════════
export async function getAllEntriesController(req: Request, res: Response) {
  try {
    const { room_id, day_of_week, language, level, group_id } =
      req.query as Record<string, string>;

    const where: any = {};
    if (room_id) where.room_id = room_id;
    if (language) where.language = language;
    if (level) where.level = level;
    if (group_id) where.group_id = group_id;
    if (day_of_week !== undefined) where.day_of_week = parseInt(day_of_week);

    const entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        room: { select: { room_id: true, name: true, capacity: true } },
        group: { select: { group_id: true, name: true } },
      },
      orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
    });

    // تجميع حسب اليوم للواجهة
    const grouped: Record<string, any[]> = {};
    for (const e of entries) {
      const dayName = DAYS_AR[e.day_of_week] ?? `يوم ${e.day_of_week}`;
      if (!grouped[dayName]) grouped[dayName] = [];
      grouped[dayName].push({ ...e, day_name: dayName });
    }

    return res.json({
      success: true,
      total: entries.length,
      data: entries,
      grouped,
    });
  } catch (error) {
    console.error("[timetable] getAllEntries:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  GET /admin/timetable/check-conflict
// ══════════════════════════════════════════════════════════════
export async function checkConflictController(req: Request, res: Response) {
  try {
    const { room_id, day_of_week, start_time, end_time, exclude_id } =
      req.query as Record<string, string>;

    if (!room_id || day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "room_id, day_of_week, start_time, end_time مطلوبة",
      });
    }

    const { conflict, existing } = await checkRoomConflict(
      room_id,
      parseInt(day_of_week),
      start_time,
      end_time,
      exclude_id,
    );

    return res.json({
      success: true,
      conflict,
      ...(conflict && {
        conflicting_entry: {
          group_label: existing.group_label,
          language: existing.language,
          day: DAYS_AR[existing.day_of_week],
          slot: `${existing.start_time} - ${existing.end_time}`,
        },
      }),
    });
  } catch (error) {
    console.error("[timetable] checkConflict:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  GET /admin/timetable/room/:roomId
// ══════════════════════════════════════════════════════════════
export async function getRoomTimetableController(req: Request, res: Response) {
  try {
    const { roomId } = req.params;

    const [room, entries] = await Promise.all([
      prisma.room.findUnique({ where: { room_id: roomId } }),
      prisma.timetableEntry.findMany({
        where: { room_id: roomId },
        include: { group: { select: { group_id: true, name: true } } },
        orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
      }),
    ]);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "القاعة غير موجودة" });
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

    return res.json({ success: true, room, weekly, entries });
  } catch (error) {
    console.error("[timetable] getRoomTimetable:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  POST /admin/timetable
// ══════════════════════════════════════════════════════════════
export async function createEntryController(req: Request, res: Response) {
  try {
    const {
      room_id,
      group_id,
      day_of_week,
      start_time,
      end_time,
      level,
      language,
      group_label,
      session_name,
    } = req.body;

    const room = await prisma.room.findUnique({ where: { room_id } });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "القاعة غير موجودة" });
    }
    if (!room.is_active) {
      return res
        .status(400)
        .json({ success: false, message: "القاعة غير نشطة" });
    }

    if (group_id) {
      const group = await prisma.group.findUnique({ where: { group_id } });
      if (!group) {
        return res
          .status(404)
          .json({ success: false, message: "الفوج غير موجود" });
      }
    }

    const { conflict, existing } = await checkRoomConflict(
      room_id,
      Number(day_of_week),
      start_time,
      end_time,
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "تعارض في التوقيت: القاعة محجوزة في هذه الفترة",
        conflict: {
          day: DAYS_AR[existing.day_of_week],
          slot: `${existing.start_time} - ${existing.end_time}`,
          group_label: existing.group_label,
          language: existing.language,
        },
      });
    }

    const entry = await prisma.timetableEntry.create({
      data: {
        room_id,
        group_id: group_id || null,
        day_of_week: Number(day_of_week),
        start_time,
        end_time,
        level,
        language,
        group_label: group_label.trim(),
        session_name: session_name || null,
        created_by: (req as any).user?.user_id || null,
      },
      include: {
        room: { select: { name: true } },
        group: { select: { name: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "تمت إضافة الحصة بنجاح",
      data: entry,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "تعارض: القاعة مسجلة بالفعل في هذا الوقت",
      });
    }
    console.error("[timetable] createEntry:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  PUT /admin/timetable/:entryId
// ══════════════════════════════════════════════════════════════
export async function updateEntryController(req: Request, res: Response) {
  try {
    const { entryId } = req.params;

    const existing = await prisma.timetableEntry.findUnique({
      where: { entry_id: entryId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "الحصة غير موجودة" });
    }

    const {
      room_id,
      group_id,
      day_of_week,
      start_time,
      end_time,
      level,
      language,
      group_label,
      session_name,
    } = req.body;

    const checkRoomId = room_id ?? existing.room_id;
    const checkDay =
      day_of_week !== undefined ? Number(day_of_week) : existing.day_of_week;
    const checkStart = start_time ?? existing.start_time;
    const checkEnd = end_time ?? existing.end_time;

    const { conflict, existing: conflictWith } = await checkRoomConflict(
      checkRoomId,
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
          group_label: conflictWith.group_label,
        },
      });
    }

    const updated = await prisma.timetableEntry.update({
      where: { entry_id: entryId },
      data: {
        ...(room_id !== undefined && { room_id }),
        ...(group_id !== undefined && { group_id }),
        ...(day_of_week !== undefined && { day_of_week: Number(day_of_week) }),
        ...(start_time !== undefined && { start_time }),
        ...(end_time !== undefined && { end_time }),
        ...(level !== undefined && { level }),
        ...(language !== undefined && { language }),
        ...(group_label !== undefined && { group_label: group_label.trim() }),
        ...(session_name !== undefined && { session_name }),
      },
      include: {
        room: { select: { name: true } },
        group: { select: { name: true } },
      },
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
    console.error("[timetable] updateEntry:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  DELETE /admin/timetable/:entryId
// ══════════════════════════════════════════════════════════════
export async function deleteEntryController(req: Request, res: Response) {
  try {
    const { entryId } = req.params;

    const entry = await prisma.timetableEntry.findUnique({
      where: { entry_id: entryId },
    });
    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: "الحصة غير موجودة" });
    }

    await prisma.timetableEntry.delete({ where: { entry_id: entryId } });
    return res.json({ success: true, message: "تم حذف الحصة بنجاح" });
  } catch (error) {
    console.error("[timetable] deleteEntry:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  DELETE /admin/timetable/bulk
// ══════════════════════════════════════════════════════════════
export async function bulkDeleteController(req: Request, res: Response) {
  try {
    const { ids } = req.body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids مطلوب" });
    }

    const { count } = await prisma.timetableEntry.deleteMany({
      where: { entry_id: { in: ids } },
    });

    return res.json({
      success: true,
      message: `تم حذف ${count} حصة`,
      deleted: count,
    });
  } catch (error) {
    console.error("[timetable] bulkDelete:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  GET /public/timetable  (عرض عام للطلاب بدون auth)
// ══════════════════════════════════════════════════════════════
export async function getPublicTimetableController(
  req: Request,
  res: Response,
) {
  try {
    const { language, level } = req.query as Record<string, string>;
    const where: any = {};
    if (language) where.language = language;
    if (level) where.level = level;

    const entries = await prisma.timetableEntry.findMany({
      where,
      include: { room: { select: { name: true } } },
      orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
    });

    return res.json({ success: true, data: entries });
  } catch (error) {
    console.error("[timetable] getPublicTimetable:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ── الفترات الافتراضية ────────────────────────────────────────
const DEFAULT_SLOTS = [
  { id: "s1", start: "08:00", end: "09:30" },
  { id: "s2", start: "09:30", end: "11:00" },
  { id: "s3", start: "11:00", end: "12:30" },
  { id: "s4", start: "12:30", end: "14:00" },
  { id: "s5", start: "14:00", end: "15:30" },
  { id: "s6", start: "15:30", end: "17:00" },
  { id: "s7", start: "17:00", end: "19:00" },
];

const SLOTS_KEY = "timetable_slots";

// ══════════════════════════════════════════════════════════════
//  GET /admin/timetable/config
// ══════════════════════════════════════════════════════════════
export async function getConfigController(req: Request, res: Response) {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: SLOTS_KEY },
    });

    const slots = setting ? JSON.parse(setting.value) : DEFAULT_SLOTS;

    return res.json({ success: true, slots });
  } catch (error) {
    console.error("[timetable] getConfig:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  PUT /admin/timetable/config
//  Body: { slots: [{ id, start, end }, ...] }
// ══════════════════════════════════════════════════════════════
export async function saveConfigController(req: Request, res: Response) {
  try {
    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "slots يجب أن تكون مصفوفة غير فارغة",
      });
    }

    function timeToMinutes(t: string) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }

    // Validation
    for (const s of slots) {
      if (!s.id || !s.start || !s.end) {
        return res.status(400).json({
          success: false,
          message: "كل فترة تحتاج: id, start, end",
        });
      }
      if (!/^\d{2}:\d{2}$/.test(s.start) || !/^\d{2}:\d{2}$/.test(s.end)) {
        return res.status(400).json({
          success: false,
          message: `صيغة الوقت غير صحيحة: ${s.start} - ${s.end}`,
        });
      }
      if (timeToMinutes(s.start) >= timeToMinutes(s.end)) {
        return res.status(400).json({
          success: false,
          message: `${s.start} - ${s.end}: البداية يجب أن تكون قبل النهاية`,
        });
      }
    }

    // تحقق من التعارض
    const sorted = [...slots].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      if (timeToMinutes(sorted[i].end) > timeToMinutes(sorted[i + 1].start)) {
        return res.status(400).json({
          success: false,
          message: `تعارض: ${sorted[i].start}-${sorted[i].end} و ${sorted[i + 1].start}-${sorted[i + 1].end}`,
        });
      }
    }

    // upsert في SystemSettings
    await prisma.systemSettings.upsert({
      where: { key: SLOTS_KEY },
      update: {
        value: JSON.stringify(sorted),
        updated_by: (req as any).user?.user_id ?? null,
      },
      create: {
        key: SLOTS_KEY,
        value: JSON.stringify(sorted),
        updated_by: (req as any).user?.user_id ?? null,
      },
    });

    return res.json({
      success: true,
      message: "تم حفظ الفترات الزمنية",
      slots: sorted,
    });
  } catch (error) {
    console.error("[timetable] saveConfig:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}

// ══════════════════════════════════════════════════════════════
//  DELETE /admin/timetable/config/reset
// ══════════════════════════════════════════════════════════════
export async function resetConfigController(req: Request, res: Response) {
  try {
    await prisma.systemSettings.deleteMany({ where: { key: SLOTS_KEY } });

    return res.json({
      success: true,
      message: "تمت إعادة الفترات للافتراضية",
      slots: DEFAULT_SLOTS,
    });
  } catch (error) {
    console.error("[timetable] resetConfig:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}
