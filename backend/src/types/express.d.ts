import "express";
import type { Types } from "mongoose";

// The minimal authenticated user attached by requireAuth middleware.
export interface AuthUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  emailVerified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth before protected controllers run.
      user: AuthUser;
    }
  }
}
