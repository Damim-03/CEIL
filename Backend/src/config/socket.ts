// ================================================================
// 📌 src/config/socket.ts
// ✅ Socket.IO Server + JWT Auth (cookie-based)
// ✅ Room structure: user:{id}, role:{ROLE}, role:ADMIN_LEVEL
// ✅ Presence tracking integrated INSIDE connection handler
// ✅ NO duplicate io.on("connection") — single handler does everything
// ================================================================

import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "./app.config";
import {
  userConnected,
  userDisconnected,
  userPageChanged,
  userHeartbeat,
  getPresenceStats,
  getOnlineUsers,
} from "../services/owner/Presence.service";
import { prisma } from "../prisma/client";

/* ── Types ── */

export interface SocketUser {
  user_id: string;
  role: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface AuthenticatedSocket extends Socket {
  user: SocketUser;
}

/* ── Singleton ── */

let io: Server | null = null;

/* ── Initialize ── */

export function initSocketIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.FRONTEND_ORIGIN,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ["websocket", "polling"],
  });

  // ── Auth middleware ──
  io.use((socket, next) => {
    try {
      const token =
        parseCookie(socket.handshake.headers.cookie || "", "accessToken") ||
        (socket.handshake.auth?.token as string) ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, config.SESSION_SECRET) as SocketUser;
      const authSocket = socket as AuthenticatedSocket;
      authSocket.user = {
        user_id: decoded.user_id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.avatar,
      };

      next();
    } catch (err: any) {
      console.error("❌ Socket auth error:", err.message);
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Single connection handler — rooms + presence + events ──
  io.on("connection", async (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { user_id, role } = socket.user;

    // ═══ 1. Join rooms ═══
    socket.join(`user:${user_id}`);
    socket.join(`role:${role}`);
    if (role === "OWNER" || role === "ADMIN") {
      socket.join("role:ADMIN_LEVEL");
    }

    console.log(`🔌 Connected: ${user_id} (${role}) — ${socket.id}`);

    // ═══ 2. Register presence (with DB fallback for email/name) ═══
    let email = socket.user.email || "";
    let name = socket.user.name || "";
    let avatar = socket.user.avatar || "";

    if (!email || !name) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { user_id },
          select: { email: true, google_avatar: true },
        });
        if (dbUser) {
          email = email || dbUser.email;
          name = name || dbUser.email.split("@")[0];
          avatar = avatar || dbUser.google_avatar || "";
        }
      } catch {
        email = email || user_id;
        name = name || user_id;
      }
    }

    userConnected({
      userId: user_id,
      socketId: socket.id,
      role,
      email,
      name,
      avatar,
      device: (socket.handshake?.query?.device as string) || "web",
      ip:
        socket.handshake?.headers?.["x-forwarded-for"]?.toString() ||
        socket.handshake?.address,
    });

    // ═══ 3. Broadcast presence update to OWNER/ADMIN ═══
    broadcastPresenceUpdate();

    // ═══ 4. Client events ═══

    // Room join/leave
    socket.on("join:group", (groupId: string) =>
      socket.join(`group:${groupId}`),
    );
    socket.on("leave:group", (groupId: string) =>
      socket.leave(`group:${groupId}`),
    );
    socket.on("join:course", (courseId: string) =>
      socket.join(`course:${courseId}`),
    );
    socket.on("leave:course", (courseId: string) =>
      socket.leave(`course:${courseId}`),
    );

    // Presence: page navigation
    socket.on("presence:pageChange", (data: { page: string }) => {
      if (data?.page) {
        userPageChanged(user_id, data.page);
        broadcastPresenceUpdate();
      }
    });

    // Presence: heartbeat
    socket.on("presence:heartbeat", () => {
      userHeartbeat(user_id);
    });

    // ═══ 5. Disconnect ═══
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Disconnected: ${user_id} (${role}) — ${reason}`);
      userDisconnected(user_id);
      broadcastPresenceUpdate();
    });
  });

  console.log("✅ Socket.IO initialized (with presence tracking)");
  return io;
}

/* ── Broadcast presence to OWNER & ADMIN ── */

function broadcastPresenceUpdate() {
  if (!io) return;
  const stats = getPresenceStats();
  const onlineList = getOnlineUsers();

  io.to("role:OWNER").to("role:ADMIN").emit("presence:update", {
    stats,
    users: onlineList.users,
  });
}

/* ── Get IO instance ── */

export function getIO(): Server {
  if (!io)
    throw new Error("Socket.IO not initialized. Call initSocketIO first.");
  return io;
}

/* ── Parse cookie helper ── */

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function emitToUser(userId: string, event: string, data?: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}
