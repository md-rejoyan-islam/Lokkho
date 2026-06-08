import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { progressSchema } from "../progress/progress.schema";
import * as important from "./important-topics.controller";
import {
  importantSubjectSchema,
  importantSubjectUpdateSchema,
  subjectTopicSchema,
  importantTopicUpdateSchema,
} from "./important-topics.schema";

const router = Router();

// Subjects (subject-wise)
router.get("/important-subjects", requireAuth, important.listImportantSubjects);
router.post("/important-subjects", requireAuth, validate(importantSubjectSchema), important.createImportantSubject);
router.put("/important-subjects/:id", requireAuth, validate(importantSubjectUpdateSchema), important.updateImportantSubject);
router.delete("/important-subjects/:id", requireAuth, important.deleteImportantSubject);

router.get("/important-subjects/:id", requireAuth, important.getImportantSubject);
router.get("/important-subjects/:id/topics", requireAuth, important.listSubjectTopics);
router.post("/important-subjects/:id/topics", requireAuth, validate(subjectTopicSchema), important.createSubjectTopic);

// Personal status on important topics
router.get("/important-progress", requireAuth, important.listImportantProgress);
router.put("/important-progress/:topicId", requireAuth, validate(progressSchema), important.upsertImportantProgress);

// Topic edit/delete (also legacy flat list)
router.get("/important-topics", requireAuth, important.listImportantTopics);
router.put("/important-topics/:id", requireAuth, validate(importantTopicUpdateSchema), important.updateImportantTopic);
router.delete("/important-topics/:id", requireAuth, important.deleteImportantTopic);

export default router;
