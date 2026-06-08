import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as applications from "./applications.controller";
import { applicationSchema, applicationUpdateSchema } from "./applications.schema";

const router = Router();

router.get("/applications", requireAuth, applications.listApplications);
router.post("/applications", requireAuth, validate(applicationSchema), applications.createApplication);
router.put("/applications/:id", requireAuth, validate(applicationUpdateSchema), applications.updateApplication);
router.delete("/applications/:id", requireAuth, applications.deleteApplication);

export default router;
