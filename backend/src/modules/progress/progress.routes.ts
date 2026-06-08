import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as progress from "./progress.controller";
import { progressSchema } from "./progress.schema";

const router = Router();

// Topic progress (personal)
router.get("/progress", requireAuth, progress.listProgress);
router.get("/progress/analytics", requireAuth, progress.progressAnalytics);
router.put("/progress/:topicId", requireAuth, validate(progressSchema), progress.upsertProgress);

// Subject progress (personal)
router.get("/subject-progress", requireAuth, progress.listSubjectProgress);
router.put("/subject-progress/:subjectId", requireAuth, validate(progressSchema), progress.upsertSubjectProgress);

export default router;
