// ================================================================
// 📦 src/services/room.service.ts
// ✅ Room management — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { emitToAdminLevel } from "../socket.service";

// ─── CREATE ──────────────────────────────────────────────

export async function createRoom(input: {
  name: string;
  capacity?: number | string;
  location?: string;
}) {
  const { name, capacity, location } = input;

  if (!name?.trim()) return { error: "name_required" as const };

  const existing = await prisma.room.findUnique({
    where: { name: name.trim() },
  });
  if (existing) return { error: "duplicate_name" as const };

  const room = await prisma.room.create({
    data: {
      name: name.trim(),
      capacity: capacity ? Number(capacity) : 30,
      location: location?.trim() || null,
    },
  });

  // 🔌 Socket
  emitToAdminLevel("room:created", {
    room_id: room.room_id,
    name: room.name,
  });

  return { data: room };
}

// ─── LIST ────────────────────────────────────────────────

export async function listRooms(params: {
  include_sessions?: boolean;
  active_only?: boolean;
}) {
  const where: any = {};
  if (params.active_only) where.is_active = true;

  return prisma.room.findMany({
    where,
    include: {
      _count: { select: { sessions: true } },
      ...(params.include_sessions && {
        sessions: {
          take: 10,
          orderBy: { session_date: "desc" as const },
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
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getRoomById(roomId: string) {
  return prisma.room.findUnique({
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
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateRoom(
  roomId: string,
  input: {
    name?: string;
    capacity?: number | string;
    location?: string;
    is_active?: boolean;
  },
) {
  const existing = await prisma.room.findUnique({
    where: { room_id: roomId },
  });
  if (!existing) return { error: "not_found" as const };

  // Check duplicate name if changed
  if (input.name && input.name.trim() !== existing.name) {
    const duplicate = await prisma.room.findUnique({
      where: { name: input.name.trim() },
    });
    if (duplicate) return { error: "duplicate_name" as const };
  }

  const room = await prisma.room.update({
    where: { room_id: roomId },
    data: {
      ...(input.name && { name: input.name.trim() }),
      ...(input.capacity !== undefined && {
        capacity: Number(input.capacity),
      }),
      ...(input.location !== undefined && {
        location: input.location?.trim() || null,
      }),
      ...(input.is_active !== undefined && {
        is_active: Boolean(input.is_active),
      }),
    },
  });

  // 🔌 Socket
  emitToAdminLevel("room:updated", { room_id: roomId });

  return { data: room };
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteRoom(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { room_id: roomId },
    include: { _count: { select: { sessions: true } } },
  });

  if (!room) return { error: "not_found" as const };

  // If room has sessions, deactivate instead
  if (room._count.sessions > 0) {
    await prisma.room.update({
      where: { room_id: roomId },
      data: { is_active: false },
    });
    emitToAdminLevel("room:updated", { room_id: roomId });
    return { data: "deactivated" as const };
  }

  await prisma.room.delete({ where: { room_id: roomId } });

  // 🔌 Socket
  emitToAdminLevel("room:deleted", { room_id: roomId });

  return { data: "deleted" as const };
}

// ─── GET ROOM SCHEDULE ───────────────────────────────────

export async function getRoomSchedule(
  roomId: string,
  from?: string,
  to?: string,
) {
  const room = await prisma.room.findUnique({
    where: { room_id: roomId },
  });
  if (!room) return { error: "not_found" as const };

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  const sessions = await prisma.session.findMany({
    where: {
      room_id: roomId,
      ...(Object.keys(dateFilter).length > 0 && {
        session_date: dateFilter,
      }),
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
      _count: { select: { attendance: true } },
    },
  });

  return { data: { room, sessions } };
}

// ─── ROOMS SCHEDULE OVERVIEW ─────────────────────────────

export async function getRoomsScheduleOverview(date?: string) {
  const targetDate = date ? new Date(date) : new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const rooms = await prisma.room.findMany({
    where: { is_active: true },
    include: {
      sessions: {
        where: { session_date: { gte: dayStart, lte: dayEnd } },
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
      end_time: s.end_time,
      topic: s.topic,
      group_name: s.group.name,
      course_name: s.group.course.course_name,
      teacher_name: s.group.teacher
        ? `${s.group.teacher.first_name} ${s.group.teacher.last_name}`
        : null,
    })),
    is_occupied: room.sessions.some((s) => {
      const sessionStart = new Date(s.session_date);
      const sessionEnd = s.end_time
        ? new Date(s.end_time)
        : new Date(sessionStart.getTime() + 90 * 60000);
      return now >= sessionStart && now <= sessionEnd;
    }),
  }));

  return {
    date: targetDate.toISOString().split("T")[0],
    total_rooms: rooms.length,
    occupied_now: overview.filter((r) => r.is_occupied).length,
    rooms: overview,
  };
}

// ─── CHECK AVAILABILITY ──────────────────────────────────

export async function checkRoomAvailability(
  roomId: string,
  date: string,
  endTime?: string,
) {
  const room = await prisma.room.findUnique({
    where: { room_id: roomId },
  });
  if (!room) return { error: "not_found" as const };

  const sessionStart = new Date(date);
  const sessionEnd = endTime
    ? new Date(endTime)
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

  const conflicts = daySessions.filter((s) => {
    const existStart = new Date(s.session_date);
    const existEnd = s.end_time
      ? new Date(s.end_time)
      : new Date(existStart.getTime() + 90 * 60000);
    return existStart < sessionEnd && existEnd > sessionStart;
  });

  return {
    data: {
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
    },
  };
}