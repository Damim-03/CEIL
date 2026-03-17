import "dotenv/config";
import express, { Request, Response } from "express";
import http from "http"; // 🔌 NEW
import cors from "cors";
import session from "cookie-session";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import mainRoute from "./routes/mainRoutes";
import "./config/passport/passport.config";
import path from "node:path";
import { initSocketIO } from "./config/socket"; // 🔌 NEW

const app = express();
const server = http.createServer(app); // 🔌 NEW
const PORT = config.PORT;
const BASE_PATH = config.BASE_PATH;

// 🔌 Initialize Socket.IO
initSocketIO(server); // 🔌 NEW

// ═══ 1. Middleware ═══
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      config.FRONTEND_ORIGIN,       // https://www.ceil-eloued.com
      "http://localhost:8081",       // Expo web
      "http://localhost:3000",       // dev
      "http://localhost:19006",      // Expo Go web
    ];
    // بدون origin = React Native / Expo Go على هاتف حقيقي
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  }),
);

// ═══ 2. API Health Check ═══
app.get(
  "/api/health",
  asyncHandler(async (_: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({ message: "Hello World!" });
  }),
);

// ═══ 3. API Routes ═══
app.use("/api", mainRoute);

// ═══ 4. Frontend (Production) ═══
if (config.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(frontendPath));
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ═══ 5. Error Handler ═══
app.use(errorHandler);

// 🔌 CHANGED: server.listen instead of app.listen
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.NODE_ENV}`);
  console.log(`🔌 Socket.IO ready`);
});