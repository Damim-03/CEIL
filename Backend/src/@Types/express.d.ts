import "express";
import "passport";

declare global {
  namespace Express {
    interface User {
      user_id: string;
      role: string;
    }
  }
}

export {};
