import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as subjects from "./subjects.controller";
import { subjectSchema, subjectUpdateSchema } from "./subjects.schema";

const router = Router();

router.get("/modules/:id/subjects", requireAuth, subjects.listSubjects);
router.post("/modules/:id/subjects", requireAuth, validate(subjectSchema), subjects.createSubject);
router.put("/subjects/:id", requireAuth, validate(subjectUpdateSchema), subjects.updateSubject);
router.delete("/subjects/:id", requireAuth, subjects.deleteSubject);

export default router;
