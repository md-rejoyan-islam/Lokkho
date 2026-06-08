import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as plans from "./study-plans.controller";
import { studyPlanSchema } from "./study-plans.schema";

const router = Router();

router.get("/study-plans", requireAuth, plans.listStudyPlans);
router.post("/study-plans", requireAuth, validate(studyPlanSchema), plans.upsertStudyPlan);
router.delete("/study-plans/:id", requireAuth, plans.deleteStudyPlan);

export default router;
