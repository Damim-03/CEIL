import { Request, Response } from "express";
import { prisma } from "../../prisma/client";

/* ══════════════════════════════════════════════════════════
   CREATE ROOM
   POST /api/admin/rooms
   Body: { name, capacity?, location? }
══════════════════════════════════════════════════════════ */
export const createRoomController = async (req: Request, res: Response) => {
  try {
    const { name, capacity, location } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "اسم القاعة مطلوب" });
    }

    // Check duplicate name
    const existing = await prisma.room.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return res.status(409).json({ message: "يوجد قاعة بنفس الاسم" });
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        capacity: capacity ? Number(capacity) : 30,
        location: location?.trim() || null,
      },
    });

    return res.status(201).json({ message: "تم إنشاء القاعة بنجاح", room });
  } catch (error) {
    console.error("createRoom error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إنشاء القاعة" });
  }
};

/* ══════════════════════════════════════════════════════════
   GET ALL ROOMS
   GET /api/admin/rooms
   Query: ?include_sessions=true&active_only=true
══════════════════════════════════════════════════════════ */
export const getAllRoomsController = async (req: Request, res: Response) => {
  try {
    const { include_sessions, active_only } = req.query;

    const where: any = {};
    if (active_only === "true") {
      where.is_active = true;
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        _count: { select: { sessions: true } },
        ...(include_sessions === "true" && {
          sessions: {
            take: 10,
            orderBy: { session_date: "desc" },
            include: {
              group: {
                include: {
                  course: {
                    select: {
                      course_id: true,
                      course_name: true,
                      course_code: true,
                    },
                  },
                  teacher: {
                    select: {
                      teacher_id: true,
                      first_name: true,
                      last_name: true,
                    },
                  },
                },
              },
            },
          },
        }),
      },
      orderBy: { name: "asc" },
    });

    return res.json(rooms);
  } catch (error) {
    console.error("getAllRooms error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب القاعات" });
  }
};

/* ══════════════════════════════════════════════════════════
   GET ROOM BY ID
   GET /api/admin/rooms/:roomId
══════════════════════════════════════════════════════════ */
export const getRoomByIdController = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { room_id: roomId },
      include: {
        _count: { select: { sessions: true } },
        sessions: {
          orderBy: { session_date: "desc" },
          take: 20,
          include: {
            group: {
              include: {
                course: {
                  select: {
                    course_id: true,
                    course_name: true,
                    course_code: true,
                  },
                },
                teacher: {
                  select: {
                    teacher_id: true,
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
            _count: { select: { attendance: true } },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }

    return res.json(room);
  } catch (error) {
    console.error("getRoomById error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات القاعة" });
  }
};

/* ══════════════════════════════════════════════════════════
   UPDATE ROOM
   PUT /api/admin/rooms/:roomId
   Body: { name?, capacity?, location?, is_active? }
══════════════════════════════════════════════════════════ */
export const updateRoomController = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { name, capacity, location, is_active } = req.body;

    const existing = await prisma.room.findUnique({
      where: { room_id: roomId },
    });
    if (!existing) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }

    // Check duplicate name if changed
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.room.findUnique({
        where: { name: name.trim() },
      });
      if (duplicate) {
        return res.status(409).json({ message: "يوجد قاعة أخرى بنفس الاسم" });
      }
    }

    const room = await prisma.room.update({
      where: { room_id: roomId },
      data: {
        ...(name && { name: name.trim() }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    return res.json({ message: "تم تحديث القاعة بنجاح", room });
  } catch (error) {
    console.error("updateRoom error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث القاعة" });
  }
};

/* ══════════════════════════════════════════════════════════
   DELETE ROOM
   DELETE /api/admin/rooms/:roomId
══════════════════════════════════════════════════════════ */
export const deleteRoomController = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { room_id: roomId },
      include: { _count: { select: { sessions: true } } },
    });

    if (!room) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }

    // If room has sessions, just deactivate instead of deleting
    if (room._count.sessions > 0) {
      await prisma.room.update({
        where: { room_id: roomId },
        data: { is_active: false },
      });
      return res.json({
        message: "القاعة مرتبطة بحصص سابقة، تم تعطيلها بدلاً من حذفها",
        deactivated: true,
      });
    }

    await prisma.room.delete({ where: { room_id: roomId } });
    return res.json({ message: "تم حذف القاعة بنجاح" });
  } catch (error) {
    console.error("deleteRoom error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء حذف القاعة" });
  }
};

/* ══════════════════════════════════════════════════════════
   GET ROOM SCHEDULE
   GET /api/admin/rooms/:roomId/schedule
   Query: ?from=2026-02-01&to=2026-02-28
══════════════════════════════════════════════════════════ */
export const getRoomScheduleController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { roomId } = req.params;
    const { from, to } = req.query;

    const room = await prisma.room.findUnique({ where: { room_id: roomId } });
    if (!room) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }

    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from as string);
    if (to) dateFilter.lte = new Date(to as string);

    const sessions = await prisma.session.findMany({
      where: {
        room_id: roomId,
        ...(Object.keys(dateFilter).length > 0 && { session_date: dateFilter }),
      },
      orderBy: { session_date: "asc" },
      include: {
        group: {
          include: {
            course: {
              select: { course_id: true, course_name: true, course_code: true },
            },
            teacher: {
              select: { teacher_id: true, first_name: true, last_name: true },
            },
          },
        },
        _count: { select: { attendance: true } },
      },
    });

    return res.json({ room, sessions });
  } catch (error) {
    console.error("getRoomSchedule error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب جدول القاعة" });
  }
};

/* ══════════════════════════════════════════════════════════
   GET ALL ROOMS SCHEDULE (overview)
   GET /api/admin/rooms/schedule/overview
   Query: ?date=2026-02-14
══════════════════════════════════════════════════════════ */
export const getRoomsScheduleOverviewController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const rooms = await prisma.room.findMany({
      where: { is_active: true },
      include: {
        sessions: {
          where: {
            session_date: { gte: dayStart, lte: dayEnd },
          },
          orderBy: { session_date: "asc" },
          include: {
            group: {
              include: {
                course: {
                  select: {
                    course_id: true,
                    course_name: true,
                    course_code: true,
                  },
                },
                teacher: {
                  select: {
                    teacher_id: true,
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const now = new Date();

    const overview = rooms.map((room) => ({
      room_id: room.room_id,
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      sessions_today: room.sessions.length,
      sessions: room.sessions.map((s) => ({
        session_id: s.session_id,
        session_date: s.session_date,
        end_time: s.end_time, // ← جديد: نرسل end_time للـ frontend
        topic: s.topic,
        group_name: s.group.name,
        course_name: s.group.course.course_name,
        teacher_name: s.group.teacher
          ? `${s.group.teacher.first_name} ${s.group.teacher.last_name}`
          : null,
      })),
      // ✅ is_occupied: يستخدم end_time إذا موجود، وإلا يفترض 90 دقيقة
      is_occupied: room.sessions.some((s) => {
        const sessionStart = new Date(s.session_date);
        const sessionEnd = s.end_time
          ? new Date(s.end_time)
          : new Date(sessionStart.getTime() + 90 * 60000); // fallback 90min
        return now >= sessionStart && now <= sessionEnd;
      }),
    }));

    return res.json({
      date: targetDate.toISOString().split("T")[0],
      total_rooms: rooms.length,
      occupied_now: overview.filter((r) => r.is_occupied).length,
      rooms: overview,
    });
  } catch (error) {
    console.error("getRoomsOverview error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب ملخص القاعات" });
  }
};

/* ══════════════════════════════════════════════════════════
   CHECK ROOM AVAILABILITY
   GET /api/admin/rooms/:roomId/availability
   Query: ?date=2026-02-14T08:00:00&duration=90
══════════════════════════════════════════════════════════ */
export const checkRoomAvailabilityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { roomId } = req.params;
    const { date, end_time } = req.query;

    if (!date) {
      return res.status(400).json({ message: "التاريخ مطلوب" });
    }

    const room = await prisma.room.findUnique({ where: { room_id: roomId } });
    if (!room) {
      return res.status(404).json({ message: "القاعة غير موجودة" });
    }

    const sessionStart = new Date(date as string);
    const sessionEnd = end_time
      ? new Date(end_time as string)
      : new Date(sessionStart.getTime() + 90 * 60000);

    const dayStart = new Date(sessionStart);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(sessionStart);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = await prisma.session.findMany({
      where: {
        room_id: roomId,
        session_date: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { session_date: "asc" },
      include: {
        group: {
          include: {
            course: { select: { course_name: true } },
            teacher: { select: { first_name: true, last_name: true } },
          },
        },
      },
    });

    // ✅ يستخدم end_time الفعلي من كل حصة
    const conflicts = daySessions.filter((s) => {
      const existStart = new Date(s.session_date);
      const existEnd = s.end_time
        ? new Date(s.end_time)
        : new Date(existStart.getTime() + 90 * 60000);
      return existStart < sessionEnd && existEnd > sessionStart;
    });

    return res.json({
      available: conflicts.length === 0,
      room,
      requested: { start: sessionStart, end: sessionEnd },
      conflicts: conflicts.map((s) => ({
        session_id: s.session_id,
        session_date: s.session_date,
        end_time: s.end_time,
        topic: s.topic,
        group_name: s.group.name,
        course_name: s.group.course.course_name,
        teacher_name: s.group.teacher
          ? `${s.group.teacher.first_name} ${s.group.teacher.last_name}`
          : null,
      })),
      all_sessions_today: daySessions.length,
    });
  } catch (error) {
    console.error("checkAvailability error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء التحقق من التوفر" });
  }
};
