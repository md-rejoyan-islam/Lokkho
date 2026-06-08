import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { authLimiter } from "../../middleware/rateLimit";
import * as auth from "./auth.controller";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";

const router = Router();

router.post("/auth/register", authLimiter, validate(registerSchema), auth.register);
router.post("/auth/login", authLimiter, validate(loginSchema), auth.login);
router.post("/auth/refresh", auth.refresh);
router.post("/auth/logout", auth.logout);

router.post("/auth/forgot-password", authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post("/auth/reset-password", authLimiter, validate(resetPasswordSchema), auth.resetPassword);
router.post("/auth/verify-email", validate(verifyEmailSchema), auth.verifyEmail);
router.post("/auth/resend-verification", requireAuth, auth.resendVerification);

export default router;
