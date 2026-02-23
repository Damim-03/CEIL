// ================================================================
// 📦 src/services/session.service.ts
// ✅ Session CRUD — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { emitToAdminLevel, emitToGroup } from "../socket.service";

// ─── Includes (reusable) ─────────────────────────────────

const sessionFullInclude = {
  group: {
    include: {
      course: true,
      teacher: true,
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] as any },
        },
        include: { student: true },
      },
    },
  },
  room: true,
  _count: { select: { attendance: true } },
};

const sessionListInclude = {
  group: {
    include: {
      course: {
        select: { course_id: true, course_name: true, course_code: true },
      },
      teacher: {
        select: {
          teacher_id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] as any },
        },
        include: {
          student: {
            select: {
              student_id: true,
              first_name: true,
              last_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      },
    },
  },
  _count: { select: { attendance: true } },
};

// ─── CREATE ──────────────────────────────────────────────

export async function createSession(input: {
  group_id: string;
  session_date: string;
  end_time?: string;
  topic?: string;
  room_id?: string;
}) {
  const { group_id, session_date, end_time, topic, room_id } = input;

  if (!group_id || !session_date) {
    return { error: "validation" as const };
  }

  const group = await prisma.group.findUnique({ where: { group_id } });
  if (!group) return { error: "invalid_group" as const };

  const startDate = new Date(session_date);
  let endDate: Date | null = null;

  if (end_time) {
    endDate = new Date(end_time);
    if (endDate <= startDate) return { error: "invalid_end_time" as const };
  }

  // Room validation + conflict
  if (room_id) {
    const room = await prisma.room.findUnique({ where: { room_id } });
    if (!room) return { error: "room_not_found" as const };
    if (!room.is_active) return { error: "room_inactive" as const };

    if (endDate) {
      const conflicts = await prisma.session.findMany({
        where: {
          room_id,
          session_date: { lt: endDate },
          end_time: { gt: startDate },
        },
      });
      if (conflicts.length > 0) {
        return {
          error: "room_conflict" as const,
          conflicts: conflicts.map((c) => ({
            session_id: c.session_id,
            session_date: c.session_date,
            end_time: c.end_time,
          })),
        };
      }
    }
  }

  const session = await prisma.session.create({
    data: {
      group_id,
      session_date: startDate,
      end_time: endDate,
      topic: topic || null,
      room_id: room_id || null,
    },
    include: sessionFullInclude,
  });

  // 🔌 Socket
  emitToAdminLevel("session:created", {
    session_id: session.session_id,
    group_id: session.group_id,
    session_date: session.session_date.toISOString(),
    topic: session.topic || undefined,
    room_id: session.room_id || undefined,
  });
  emitToGroup(session.group_id, "session:created", {
    session_id: session.session_id,
    group_id: session.group_id,
    session_date: session.session_date.toISOString(),
  });

  return { data: session };
}

// ─── LIST ────────────────────────────────────────────────

export async function listSessions() {
  return prisma.session.findMany({
    include: sessionListInclude,
    orderBy: { session_date: "desc" },
  });
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getSessionById(sessionId: string) {
  return prisma.session.findUnique({
    where: { session_id: sessionId },
    include: {
      attendance: {
        include: {
          student: {
            select: {
              student_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      },
      group: {
        include: {
          course: {
            select: { course_id: true, course_name: true, course_code: true },
          },
          teacher: {
            select: {
              teacher_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          enrollments: {
            where: {
              registration_status: {
                in: ["VALIDATED", "PAID", "FINISHED"] as any,
              },
            },
            include: {
              student: {
                select: {
                  student_id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      },
      _count: { select: { attendance: true } },
    },
  });
}

// ─── GET ATTENDANCE ──────────────────────────────────────

export async function getSessionAttendance(sessionId: string) {
  return prisma.attendance.findMany({
    where: { session_id: sessionId },
    include: {
      student: {
        select: {
          student_id: true,
          first_name: true,
          last_name: true,
          email: true,
          avatar_url: true,
        },
      },
    },
    orderBy: { student: { first_name: "asc" } },
  });
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateSession(
  sessionId: string,
  input: {
    session_date?: string;
    end_time?: string;
    topic?: string;
    room_id?: string;
  },
) {
  const existing = await prisma.session.findUnique({
    where: { session_id: sessionId },
  });
  if (!existing) return { error: "not_found" as const };

  const updateData: any = {};
  if (input.topic !== undefined) updateData.topic = input.topic || null;
  if (input.room_id !== undefined) updateData.room_id = input.room_id || null;

  const effectiveStart = input.session_date
    ? new Date(input.session_date)
    : existing.session_date;
  let effectiveEnd: Date | null = existing.end_time;

  if (input.session_date) updateData.session_date = effectiveStart;
  if (input.end_time !== undefined) {
    effectiveEnd = input.end_time ? new Date(input.end_time) : null;
    updateData.end_time = effectiveEnd;
  }

  if (effectiveEnd && effectiveEnd <= effectiveStart) {
    return { error: "invalid_end_time" as const };
  }

  // Room conflict
  const targetRoomId =
    input.room_id !== undefined ? input.room_id : existing.room_id;
  if (targetRoomId && effectiveEnd) {
    const conflicts = await prisma.session.findMany({
      where: {
        room_id: targetRoomId,
        session_id: { not: sessionId },
        session_date: { lt: effectiveEnd },
        end_time: { gt: effectiveStart },
      },
    });
    if (conflicts.length > 0) {
      return {
        error: "room_conflict" as const,
        conflicts: conflicts.map((c) => ({
          session_id: c.session_id,
          session_date: c.session_date,
          end_time: c.end_time,
        })),
      };
    }
  }

  // Room validation
  if (input.room_id) {
    const room = await prisma.room.findUnique({
      where: { room_id: input.room_id },
    });
    if (!room) return { error: "room_not_found" as const };
    if (!room.is_active) return { error: "room_inactive" as const };
  }

  const session = await prisma.session.update({
    where: { session_id: sessionId },
    data: updateData,
    include: sessionFullInclude,
  });

  return { data: session };
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteSession(sessionId: string) {
  const attendanceCount = await prisma.attendance.count({
    where: { session_id: sessionId },
  });

  if (attendanceCount > 0) {
    return { error: "has_attendance" as const };
  }

  const session = await prisma.session.findUnique({
    where: { session_id: sessionId },
  });

  if (!session) return { error: "not_found" as const };

  await prisma.session.delete({ where: { session_id: sessionId } });

  // 🔌 Socket
  emitToAdminLevel("session:deleted", {
    session_id: sessionId,
    group_id: session.group_id,
  });

  return { data: true };
}