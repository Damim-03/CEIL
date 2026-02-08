import "dotenv/config";
import express, { Request, Response } from "express";
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

const app = express();
const BASE_PATH = config.BASE_PATH;

// ═══ 1. Middleware ═══
app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true }));
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

app.listen(config.PORT, async () => {
  console.log(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV}`);
});
