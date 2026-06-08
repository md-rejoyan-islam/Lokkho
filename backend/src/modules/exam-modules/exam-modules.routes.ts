import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as modules from "./exam-modules.controller";
import { moduleSchema, moduleUpdateSchema } from "./exam-modules.schema";

const router = Router();

router.get("/modules", requireAuth, modules.listModules);
router.get("/modules/:id", requireAuth, modules.getModule);
router.post("/modules", requireAuth, validate(moduleSchema), modules.createModule);
router.put("/modules/:id", requireAuth, validate(moduleUpdateSchema), modules.updateModule);
router.delete("/modules/:id", requireAuth, modules.deleteModule);

export default router;
