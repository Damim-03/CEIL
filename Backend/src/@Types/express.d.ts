import { JwtUser } from "../middlewares/auth.middleware";
import "express";
import "passport";

declare global {
  namespace Express {
    interface User {
      user_id: string;
      role: string;
    }

    interface Request {
      user?: JwtUser;
    }
  }
}

export {};
