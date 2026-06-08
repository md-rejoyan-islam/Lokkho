import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as users from "./users.controller";
import { updateProfileSchema, changePasswordSchema } from "./users.schema";

const router = Router();

// Logged-in user's own account (kept under /auth/* for API compatibility).
router.get("/auth/me", requireAuth, users.me);
router.put("/auth/profile", requireAuth, validate(updateProfileSchema), users.updateProfile);
router.put("/auth/password", requireAuth, validate(changePasswordSchema), users.changePassword);
router.delete("/auth/account", requireAuth, users.deleteAccount);

export default router;
